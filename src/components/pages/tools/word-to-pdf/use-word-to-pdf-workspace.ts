// src/components/pages/tools/word-to-pdf/use-word-to-pdf-workspace.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { fetchCloudCapabilities } from "./word-to-pdf-cloud-engine";
import {
  DEFAULT_SETTINGS,
  WORD_TO_PDF_LIMITS,
} from "./word-to-pdf-constants";
import { getEngine, runWordToPdf, selectEngineId } from "./word-to-pdf-engine";
import {
  describeError,
  SERVER_FALLBACK_CODES,
  toWordToPdfError,
  WordToPdfError,
} from "./word-to-pdf-errors";
import type {
  ConversionProgress,
  EngineId,
  ValidatedWordFile,
  WordToPdfSettings,
} from "./word-to-pdf-types";
import { getExtension } from "./word-to-pdf-utils";
import { validateWordFile } from "./word-to-pdf-validation";

export type WorkspacePhase =
  | "idle"
  | "validating"
  | "ready"
  | "converting"
  | "success"
  | "error"
  | "cancelled";

export type CloudState =
  | { status: "checking" }
  | { status: "available"; maxFileBytes: number }
  | { status: "unavailable" };

export type DownloadState = "idle" | "downloading" | "error";

export interface ConversionResultState {
  url: string;
  fileName: string;
  sizeBytes: number;
  pageCount: number | null;
  engine: EngineId;
}

export function useWordToPdfWorkspace() {
  const [phase, setPhase] = useState<WorkspacePhase>("idle");
  const [file, setFile] = useState<ValidatedWordFile | null>(null);
  const [selectionError, setSelectionError] = useState<WordToPdfError | null>(null);
  const [error, setError] = useState<WordToPdfError | null>(null);
  const [progress, setProgress] = useState<ConversionProgress | null>(null);
  const [result, setResult] = useState<ConversionResultState | null>(null);
  const [settings, setSettings] = useState<WordToPdfSettings>(DEFAULT_SETTINGS);
  const [cloud, setCloud] = useState<CloudState>({ status: "checking" });
  const [consent, setConsent] = useState(false);
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");
  const [lastEngine, setLastEngine] = useState<EngineId | null>(null);

  const mountedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);
  const cloudPromiseRef = useRef<Promise<CloudState> | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const selectTokenRef = useRef(0);
  const downloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const revokeResultUrl = useCallback(() => {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
  }, []);

  const ensureCloud = useCallback((): Promise<CloudState> => {
    if (!cloudPromiseRef.current) {
      cloudPromiseRef.current = fetchCloudCapabilities().then((capabilities) => {
        const next: CloudState = capabilities.available
          ? { status: "available", maxFileBytes: capabilities.maxFileBytes }
          : { status: "unavailable" };
        if (mountedRef.current) setCloud(next);
        return next;
      });
    }
    return cloudPromiseRef.current;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void ensureCloud();
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      revokeResultUrl();
      if (downloadTimerRef.current) clearTimeout(downloadTimerRef.current);
    };
  }, [ensureCloud, revokeResultUrl]);

  const selectFile = useCallback(
    async (files: readonly File[]) => {
      if (phase === "converting" || files.length === 0) return;
      const candidate = files[0];
      if (!candidate) return;

      setSelectionError(null);
      if (files.length > 1) {
        setSelectionError(new WordToPdfError("MULTIPLE_FILES"));
        return;
      }

      const previousPhase = phase;
      const token = ++selectTokenRef.current;
      setPhase("validating");

      const restorePrevious = () => setPhase(file ? previousPhase : "idle");

      const needsCloudInfo = getExtension(candidate.name) === "doc";
      const cloudState = needsCloudInfo ? await ensureCloud() : cloud;
      if (!mountedRef.current || token !== selectTokenRef.current) return;

      const legacyLimit =
        cloudState.status === "available"
          ? cloudState.maxFileBytes
          : WORD_TO_PDF_LIMITS.maxLegacyFileBytes;
      const validation = await validateWordFile(candidate, {
        ...WORD_TO_PDF_LIMITS,
        maxLegacyFileBytes: legacyLimit,
      });
      if (!mountedRef.current || token !== selectTokenRef.current) return;

      if (!validation.ok) {
        setSelectionError(validation.error);
        restorePrevious();
        return;
      }
      if (validation.value.format === "doc" && cloudState.status !== "available") {
        setSelectionError(new WordToPdfError("ENGINE_UNAVAILABLE"));
        restorePrevious();
        return;
      }

      revokeResultUrl();
      setResult(null);
      setError(null);
      setProgress(null);
      setConsent(false);
      setDownloadState("idle");
      setLastEngine(null);
      setFile(validation.value);
      setPhase("ready");
    },
    [phase, file, cloud, ensureCloud, revokeResultUrl],
  );

  const reset = useCallback(() => {
    selectTokenRef.current += 1;
    abortRef.current?.abort();
    revokeResultUrl();
    setFile(null);
    setResult(null);
    setError(null);
    setSelectionError(null);
    setProgress(null);
    setConsent(false);
    setDownloadState("idle");
    setLastEngine(null);
    setPhase("idle");
  }, [revokeResultUrl]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const convert = useCallback(
    async (options?: { preferCloud?: boolean }) => {
      if (!file) return;
      if (phase !== "ready" && phase !== "cancelled" && phase !== "error") return;

      const engineId = selectEngineId({
        format: file.format,
        cloudAvailable: cloud.status === "available",
        preferCloud: options?.preferCloud,
      });
      if (!engineId) {
        setError(new WordToPdfError("ENGINE_UNAVAILABLE"));
        setPhase("error");
        return;
      }
      if (engineId === "cloud" && !consent) {
        setError(new WordToPdfError("CONSENT_REQUIRED"));
        setPhase("error");
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;

      revokeResultUrl();
      setResult(null);
      setError(null);
      setSelectionError(null);
      setLastEngine(engineId);
      setProgress({ phase: "reading", message: "Starting…" });
      setPhase("converting");

      try {
        const output = await runWordToPdf(getEngine(engineId), {
          file,
          settings,
          signal: controller.signal,
          onProgress: (next) => {
            if (mountedRef.current && !controller.signal.aborted) setProgress(next);
          },
        });
        if (!mountedRef.current) return;
        if (controller.signal.aborted) throw new WordToPdfError("CANCELLED");

        const url = URL.createObjectURL(output.blob);
        resultUrlRef.current = url;
        setResult({
          url,
          fileName: output.fileName,
          sizeBytes: output.sizeBytes,
          pageCount: output.pageCount,
          engine: output.engine,
        });
        setDownloadState("idle");
        setProgress(null);
        setPhase("success");
      } catch (caught) {
        if (!mountedRef.current) return;
        const converted = toWordToPdfError(caught);
        setProgress(null);
        if (converted.code === "CANCELLED") {
          setPhase("cancelled");
          return;
        }
        setError(converted);
        setPhase("error");
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [file, phase, cloud, consent, settings, revokeResultUrl],
  );

  const backToReady = useCallback(() => {
    setError(null);
    setPhase("ready");
  }, []);

  const download = useCallback(() => {
    if (!result || downloadState === "downloading") return;
    setDownloadState("downloading");
    try {
      const anchor = document.createElement("a");
      anchor.href = result.url;
      anchor.download = result.fileName;
      anchor.rel = "noopener";
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      if (downloadTimerRef.current) clearTimeout(downloadTimerRef.current);
      downloadTimerRef.current = setTimeout(() => {
        if (mountedRef.current) setDownloadState("idle");
      }, 1200);
    } catch {
      setDownloadState("error");
    }
  }, [result, downloadState]);

  const updateSettings = useCallback((patch: Partial<WordToPdfSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const engineChoice = useMemo<EngineId | null>(
    () =>
      file
        ? selectEngineId({
            format: file.format,
            cloudAvailable: cloud.status === "available",
          })
        : null,
    [file, cloud.status],
  );

  const needsConsent = engineChoice === "cloud";
  const canConvert =
    file !== null &&
    engineChoice !== null &&
    (phase === "ready" || phase === "cancelled") &&
    (!needsConsent || consent);

  const serverFallbackAvailable =
    phase === "error" &&
    error !== null &&
    SERVER_FALLBACK_CODES.has(error.code) &&
    lastEngine === "local" &&
    cloud.status === "available" &&
    file !== null &&
    file.sizeBytes <= cloud.maxFileBytes;

  const announcement = useMemo(() => {
    switch (phase) {
      case "validating":
        return "Checking your document…";
      case "ready":
        return file ? `${file.safeName} is ready to convert.` : "";
      case "converting":
        return progress?.message ?? "Converting…";
      case "success":
        return "Your PDF is ready to download.";
      case "cancelled":
        return "Conversion cancelled.";
      case "error":
        return error ? describeError(error.code, error.detail).title : "";
      default:
        return selectionError
          ? describeError(selectionError.code, selectionError.detail).title
          : "";
    }
  }, [phase, file, progress, error, selectionError]);

  return {
    phase,
    file,
    selectionError,
    error,
    progress,
    result,
    settings,
    cloud,
    consent,
    downloadState,
    engineChoice,
    activeEngine: lastEngine ?? engineChoice,
    needsConsent,
    canConvert,
    serverFallbackAvailable,
    announcement,
    selectFile,
    reset,
    cancel,
    convert,
    backToReady,
    download,
    updateSettings,
    setConsent,
    dismissSelectionError: () => setSelectionError(null),
  };
}

export type WordToPdfWorkspaceState = ReturnType<typeof useWordToPdfWorkspace>;
