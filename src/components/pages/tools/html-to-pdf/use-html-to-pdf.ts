"use client";

/**
 * PDFBerri HTML → PDF — Client Hook
 * Manages UI state machine and talks to the conversion API.
 */

import { useCallback, useRef, useState } from "react";
import type {
  ConversionError,
  ConversionResult,
  ConversionStage,
  HtmlInput,
  InputMode,
  PdfSettings,
} from "./html-to-pdf-types";
import { DEFAULT_PDF_SETTINGS } from "./html-to-pdf-types";
import { STAGE_MESSAGES } from "./html-to-pdf-constants";

export interface UseHtmlToPdfState {
  stage: ConversionStage;
  inputMode: InputMode;
  settings: PdfSettings;
  result: ConversionResult | null;
  error: ConversionError | null;
  stageMessage: string;
  progress: number | null; // null = indeterminate
  isProcessing: boolean;
}

export function useHtmlToPdf() {
  const [stage, setStage] = useState<ConversionStage>("idle");
  const [inputMode, setInputMode] = useState<InputMode>("file");
  const [settings, setSettings] = useState<PdfSettings>(DEFAULT_PDF_SETTINGS);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<ConversionError | null>(null);
  const [stageMessage, setStageMessage] = useState("");
  const [progress, setProgress] = useState<number | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const isProcessing =
    stage === "validating" ||
    stage === "preparing" ||
    stage === "resource-loading" ||
    stage === "rendering" ||
    stage === "generating-pdf" ||
    stage === "validating-pdf";

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStage("idle");
    setResult(null);
    setError(null);
    setStageMessage("");
    setProgress(null);
  }, []);

  const updateSettings = useCallback((partial: Partial<PdfSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const convert = useCallback(
    async (input: HtmlInput) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setError(null);
      setResult(null);
      setStage("validating");
      setStageMessage(STAGE_MESSAGES.validating);
      setProgress(null);

      try {
        // Build FormData for file or JSON for code/url
        const form = new FormData();
        form.append("mode", input.mode);
        form.append("settings", JSON.stringify(settings));

        if (input.mode === "file" && input.file) {
          form.append("file", input.file);
        } else if (input.mode === "code") {
          form.append("content", input.content || "");
        } else if (input.mode === "url") {
          form.append("url", input.url || "");
        }

        const res = await fetch("/api/tools/html-to-pdf/convert", {
          method: "POST",
          body: form,
          signal: controller.signal,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const err: ConversionError = data.error || {
            code: "INTERNAL_ERROR",
            title: "Something went wrong",
            message: data.message || "Conversion failed",
            retryable: true,
          };
          setError(err);
          setStage("failed");
          setStageMessage(err.title);
          return;
        }

        // For streaming progress we could use SSE; for simplicity poll or single response
        // Here the API returns the final result (or a job id for long-running)
        const data = await res.json();

        if (data.result) {
          setResult(data.result as ConversionResult);
          setStage("completed");
          setStageMessage(STAGE_MESSAGES.completed);
          setProgress(100);
        } else if (data.jobId) {
          // Future: poll /api/tools/html-to-pdf/status/:jobId
          setStage("completed");
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setStage("cancelled");
          setStageMessage(STAGE_MESSAGES.cancelled);
          return;
        }
        setError({
          code: "INTERNAL_ERROR",
          title: "Something went wrong",
          message: "Network or unexpected error during conversion.",
          retryable: true,
        });
        setStage("failed");
      }
    },
    [settings]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setStage("cancelled");
    setStageMessage(STAGE_MESSAGES.cancelled);
  }, []);

  return {
    stage,
    inputMode,
    setInputMode,
    settings,
    updateSettings,
    result,
    error,
    stageMessage,
    progress,
    isProcessing,
    convert,
    cancel,
    reset,
  };
}
