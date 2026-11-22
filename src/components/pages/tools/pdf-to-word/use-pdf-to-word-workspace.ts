// src/components/pages/tools/pdf-to-word/use-pdf-to-word-workspace.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { convertPdfToWord } from "./pdf-to-word-engine";
import { inspectPdf } from "./pdf-to-word-pdfjs";
import type {
  ConversionMode,
  ConversionOptions,
  WorkspaceState,
} from "./pdf-to-word-types";
import { toErrorInfo } from "./pdf-to-word-utils";
import { validatePdfFile } from "./pdf-to-word-validation";

export function usePdfToWordWorkspace() {
  const [state, setState] = useState<WorkspaceState>({ status: "idle" });
  const [options, setOptions] = useState<ConversionOptions>({
    mode: "layout",
    ocrEnabled: false,
    ocrLanguage: "eng",
  });

  const jobRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const passwordRef = useRef<string | undefined>(undefined);
  const ocrTouchedRef = useRef(false);

  const startInspection = useCallback(async (file: File, password?: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const jobId = (jobRef.current += 1);
    passwordRef.current = password;

    setState({ status: "validating", file });
    try {
      await validatePdfFile(file);
      const inspection = await inspectPdf(file, password, controller.signal);
      if (jobRef.current !== jobId) return;
      if (inspection.likelyScanned && !ocrTouchedRef.current) {
        setOptions((o) => ({ ...o, ocrEnabled: true }));
      }
      setState({ status: "ready", file, inspection });
    } catch (error) {
      if (jobRef.current !== jobId) return;
      const info = toErrorInfo(error);
      if (info.code === "password-required" || info.code === "incorrect-password") {
        setState({
          status: "needs-password",
          file,
          incorrect: info.code === "incorrect-password",
        });
      } else if (info.code === "cancelled") {
        setState({ status: "idle" });
      } else {
        setState({ status: "failed", file, inspection: null, error: info });
      }
    }
  }, []);

  const selectFile = useCallback(
    (file: File) => {
      if (state.status === "validating" || state.status === "converting") return;
      void startInspection(file);
    },
    [state.status, startInspection],
  );

  const submitPassword = useCallback(
    (password: string) => {
      if (state.status !== "needs-password") return;
      void startInspection(state.file, password);
    },
    [state, startInspection],
  );

  const convert = useCallback(async () => {
    let file: File;
    let inspection;
    if (
      state.status === "ready" ||
      state.status === "cancelled" ||
      (state.status === "failed" && state.inspection)
    ) {
      file = state.file;
      inspection = state.inspection!;
    } else {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const jobId = (jobRef.current += 1);

    setState({ status: "converting", file, inspection, progress: null });
    try {
      const result = await convertPdfToWord({
        file,
        options,
        password: passwordRef.current,
        signal: controller.signal,
        onProgress: (progress) => {
          if (jobRef.current !== jobId) return;
          setState((s) => (s.status === "converting" ? { ...s, progress } : s));
        },
      });
      if (jobRef.current !== jobId) return;
      setState({ status: "completed", file, inspection, result });
    } catch (error) {
      if (jobRef.current !== jobId) return;
      const info = toErrorInfo(error);
      setState(
        info.code === "cancelled"
          ? { status: "cancelled", file, inspection }
          : { status: "failed", file, inspection, error: info },
      );
    }
  }, [state, options]);

  const cancel = useCallback(() => {
    if (state.status !== "converting") return;
    jobRef.current += 1; // ignore anything the aborted job still reports
    abortRef.current?.abort();
    setState({
      status: "cancelled",
      file: state.file,
      inspection: state.inspection,
    });
  }, [state]);

  const reset = useCallback(() => {
    jobRef.current += 1;
    abortRef.current?.abort();
    passwordRef.current = undefined;
    ocrTouchedRef.current = false;
    setState({ status: "idle" });
  }, []);

  const setMode = useCallback((mode: ConversionMode) => {
    setOptions((o) => ({ ...o, mode }));
  }, []);

  const setOcrEnabled = useCallback((ocrEnabled: boolean) => {
    ocrTouchedRef.current = true;
    setOptions((o) => ({ ...o, ocrEnabled }));
  }, []);

  const setOcrLanguage = useCallback((ocrLanguage: string) => {
    setOptions((o) => ({ ...o, ocrLanguage }));
  }, []);

  useEffect(
    () => () => {
      jobRef.current += 1;
      abortRef.current?.abort();
    },
    [],
  );

  return {
    state,
    options,
    selectFile,
    submitPassword,
    convert,
    cancel,
    reset,
    setMode,
    setOcrEnabled,
    setOcrLanguage,
  };
}