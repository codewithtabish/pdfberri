"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { DEFAULT_PERMISSIONS, PROTECT_LIMITS } from "./protect-config";
import { LocalProtectEngine } from "./protect-engine";
import {
  ProtectPdfEngineError,
  type ProtectPdfDocument,
  type ProtectPdfEngine,
  type ProtectPdfErrorCode,
  type ProtectPdfJobState,
  type ProtectPdfPermissions,
  type ProtectPdfResult,
  type ProtectPdfStatus,
} from "./protect-types";
import {
  buildProtectedFileName,
  createId,
  toErrorCode,
  triggerDownload,
  wipeBuffer,
} from "./protect-utils";
import { evaluatePasswordStrength, validatePasswords, validatePdfFile } from "./protect-validation";

const BUSY_STATUSES: ReadonlySet<ProtectPdfStatus> = new Set([
  "validating",
  "loading-engine",
  "protecting",
  "verifying",
]);

const initialState: ProtectPdfJobState = {
  status: "idle",
  document: null,
  password: "",
  confirmPassword: "",
  existingPassword: "",
  existingPasswordRejected: false,
  permissions: { ...DEFAULT_PERMISSIONS },
  showValidation: false,
  protectRequested: false,
  downloaded: false,
  result: null,
  error: null,
};

type Action =
  | { type: "select-start" }
  | { type: "engine-loading" }
  | { type: "document-ready"; document: ProtectPdfDocument }
  | { type: "set-password"; value: string }
  | { type: "set-confirm"; value: string }
  | { type: "set-existing"; value: string }
  | { type: "toggle-permission"; key: keyof ProtectPdfPermissions }
  | { type: "show-validation" }
  | { type: "protect-start" }
  | { type: "stage"; status: "protecting" | "verifying" }
  | { type: "existing-rejected" }
  | { type: "complete"; result: ProtectPdfResult }
  | { type: "downloaded" }
  | { type: "fail"; code: ProtectPdfErrorCode; clearSecrets: boolean }
  | { type: "dismiss-error" }
  | { type: "reset" };

function reducer(state: ProtectPdfJobState, action: Action): ProtectPdfJobState {
  switch (action.type) {
    case "select-start":
      if (BUSY_STATUSES.has(state.status)) return state;
      return { ...initialState, permissions: state.permissions, status: "validating" };

    case "engine-loading":
      return state.status === "validating" ? { ...state, status: "loading-engine" } : state;

    case "document-ready":
      if (state.status !== "loading-engine") return state;
      return { ...state, status: "configuring", document: action.document };

    case "set-password":
      return state.status === "configuring" ? { ...state, password: action.value } : state;

    case "set-confirm":
      return state.status === "configuring" ? { ...state, confirmPassword: action.value } : state;

    case "set-existing":
      return state.status === "configuring"
        ? { ...state, existingPassword: action.value, existingPasswordRejected: false }
        : state;

    case "toggle-permission":
      return state.status === "configuring"
        ? { ...state, permissions: { ...state.permissions, [action.key]: !state.permissions[action.key] } }
        : state;

    case "show-validation":
      return state.status === "configuring" ? { ...state, showValidation: true } : state;

    case "protect-start":
      if (state.status !== "configuring" || !state.document) return state;
      return {
        ...state,
        status: "validating",
        protectRequested: true,
        showValidation: false,
        existingPasswordRejected: false,
        error: null,
      };

    case "stage":
      if (!state.protectRequested) return state;
      if (
        action.status === "protecting" &&
        (state.status === "validating" || state.status === "loading-engine")
      ) {
        return { ...state, status: "protecting" };
      }
      if (action.status === "verifying" && state.status === "protecting") {
        return { ...state, status: "verifying" };
      }
      return state;

    case "existing-rejected":
      return { ...state, status: "configuring", protectRequested: false, existingPassword: "", existingPasswordRejected: true };

    case "complete":
      if (state.status !== "verifying") return state;
      return {
        ...state,
        status: "completed",
        protectRequested: false,
        password: "",
        confirmPassword: "",
        existingPassword: "",
        showValidation: false,
        downloaded: false,
        result: action.result,
        error: null,
      };

    case "downloaded":
      // Clear the form once the file is saved: the document and every password are dropped,
      // while the result card stays so the file can be downloaded again.
      if (state.status !== "completed" || !state.result) return state;
      return {
        ...state,
        downloaded: true,
        document: null,
        password: "",
        confirmPassword: "",
        existingPassword: "",
        existingPasswordRejected: false,
        showValidation: false,
        error: null,
      };

    case "fail":
      return {
        ...state,
        status: "error",
        protectRequested: false,
        error: action.code,
        password: action.clearSecrets ? "" : state.password,
        confirmPassword: action.clearSecrets ? "" : state.confirmPassword,
        existingPassword: action.clearSecrets ? "" : state.existingPassword,
      };

    case "dismiss-error":
      return {
        ...state,
        error: null,
        status: state.result ? "completed" : state.document ? "configuring" : "idle",
      };

    case "reset":
      return { ...initialState };

    default:
      return state;
  }
}

export function useProtectWorkspace() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const engineRef = useRef<ProtectPdfEngine | null>(null);
  const jobRef = useRef(0);
  const blobUrlRef = useRef<string | null>(null);

  const releaseBlob = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  const disposeEngine = useCallback(() => {
    engineRef.current?.dispose();
    engineRef.current = null;
  }, []);

  const getEngine = useCallback((): ProtectPdfEngine => {
    engineRef.current ??= new LocalProtectEngine();
    return engineRef.current;
  }, []);

  const teardown = useCallback(() => {
    jobRef.current += 1;
    releaseBlob();
    disposeEngine();
  }, [releaseBlob, disposeEngine]);

  useEffect(() => teardown, [teardown]);

  const selectFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0 || BUSY_STATUSES.has(state.status)) return;

      const job = ++jobRef.current;
      const isStale = () => job !== jobRef.current;

      releaseBlob();
      dispatch({ type: "select-start" });

      try {
        const [file] = files;
        if (files.length > 1 || !file) throw new ProtectPdfEngineError("multiple-files");

        await validatePdfFile(file);
        if (isStale()) return;

        dispatch({ type: "engine-loading" });
        const engine = getEngine();
        await engine.init();
        if (isStale()) return;

        const inspection = await engine.inspectDocument(await file.arrayBuffer());
        if (isStale()) return;

        switch (inspection.state) {
          case "plain":
          case "needs-password":
            dispatch({
              type: "document-ready",
              document: {
                id: createId(),
                file,
                name: file.name,
                sizeBytes: file.size,
                pageCount: inspection.pageCount,
                requiresExistingPassword: inspection.state === "needs-password",
              },
            });
            break;
          case "restricted":
            throw new ProtectPdfEngineError("existing-restrictions");
          case "unsupported-encryption":
            throw new ProtectPdfEngineError("unsupported-encryption");
          case "corrupt":
            throw new ProtectPdfEngineError("corrupted");
          default:
            throw new ProtectPdfEngineError("unknown");
        }
      } catch (error) {
        if (isStale()) return;
        disposeEngine();
        dispatch({ type: "fail", code: toErrorCode(error), clearSecrets: true });
      }
    },
    [state.status, releaseBlob, getEngine, disposeEngine]
  );

  const protect = useCallback(async () => {
    const doc = state.document;
    if (!doc || state.status !== "configuring") return;

    const validation = validatePasswords(state.password, state.confirmPassword);
    const existingMissing = doc.requiresExistingPassword && state.existingPassword.length === 0;
    if (!validation.isValid || existingMissing) {
      dispatch({ type: "show-validation" });
      return;
    }

    const job = ++jobRef.current;
    const isStale = () => job !== jobRef.current;
    const { password, existingPassword, permissions } = state;
    const usesExisting = doc.requiresExistingPassword;

    dispatch({ type: "protect-start" });

    try {
      dispatch({ type: "engine-loading" });
      const engine = getEngine();
      await engine.init();
      if (isStale()) return;

      let pageCount = doc.pageCount;
      if (usesExisting) {
        const inspection = await engine.inspectDocument(await doc.file.arrayBuffer(), existingPassword);
        if (isStale()) return;
        if (inspection.state === "wrong-password") {
          dispatch({ type: "existing-rejected" });
          return;
        }
        if (inspection.state !== "unlocked" || inspection.pageCount === null) {
          throw new ProtectPdfEngineError("protect-failed");
        }
        pageCount = inspection.pageCount;
      }
      if (pageCount === null) throw new ProtectPdfEngineError("protect-failed");

      dispatch({ type: "stage", status: "protecting" });
      const output = await engine.protect(await doc.file.arrayBuffer(), {
        userPassword: password,
        existingPassword: usesExisting ? existingPassword : undefined,
        permissions,
      });
      if (isStale()) return;

      dispatch({ type: "stage", status: "verifying" });
      const verification = await engine.verifyProtectedOutput(output.slice(0), {
        password,
        expectedPageCount: pageCount,
        permissions,
      });
      if (isStale()) return;

      const blob = new Blob([output], { type: "application/pdf" });
      wipeBuffer(output);

      releaseBlob();
      const blobUrl = URL.createObjectURL(blob);
      blobUrlRef.current = blobUrl;

      dispatch({
        type: "complete",
        result: {
          fileName: buildProtectedFileName(doc.name),
          sizeBytes: blob.size,
          pageCount,
          blobUrl,
          verification,
          permissions,
        },
      });
      disposeEngine();
    } catch (error) {
      if (isStale()) return;
      disposeEngine();
      dispatch({ type: "fail", code: toErrorCode(error), clearSecrets: true });
    }
  }, [state, getEngine, releaseBlob, disposeEngine]);

  const download = useCallback(() => {
    const result = state.result;
    if (!result) return;
    try {
      triggerDownload(result.blobUrl, result.fileName);
      dispatch({ type: "downloaded" });
    } catch {
      dispatch({ type: "fail", code: "download-failed", clearSecrets: false });
    }
  }, [state.result]);

  const reset = useCallback(() => {
    if (BUSY_STATUSES.has(state.status)) return;
    teardown();
    dispatch({ type: "reset" });
  }, [state.status, teardown]);

  const dismissError = useCallback(() => dispatch({ type: "dismiss-error" }), []);
  const setPassword = useCallback((value: string) => dispatch({ type: "set-password", value }), []);
  const setConfirmPassword = useCallback((value: string) => dispatch({ type: "set-confirm", value }), []);
  const setExistingPassword = useCallback((value: string) => dispatch({ type: "set-existing", value }), []);
  const togglePermission = useCallback(
    (key: keyof ProtectPdfPermissions) => dispatch({ type: "toggle-permission", key }),
    []
  );

  const validation = useMemo(
    () => validatePasswords(state.password, state.confirmPassword),
    [state.password, state.confirmPassword]
  );
  const strength = useMemo(() => evaluatePasswordStrength(state.password), [state.password]);

  return {
    state,
    validation,
    strength,
    isBusy: BUSY_STATUSES.has(state.status),
    largeFile: (state.document?.sizeBytes ?? 0) > PROTECT_LIMITS.largeFileWarningBytes,
    selectFiles,
    protect,
    download,
    reset,
    dismissError,
    setPassword,
    setConfirmPassword,
    setExistingPassword,
    togglePermission,
  };
}