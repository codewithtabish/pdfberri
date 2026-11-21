"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { localEngine } from "./compress-engine-local";
import type { PdfCompressionEngine } from "./compress-engine";
import { DEFAULT_CUSTOM_SETTINGS, resolveSettings } from "./compress-planner";
import type {
  CompressProgress,
  CompressResult,
  CompressStatus,
  CompressionMode,
  CompressionSettings,
  ProcessingMethod,
  SourceDocument,
} from "./compress-types";
import { CompressError, compareSizes, createId, sanitizeFilename, toErrorMessage } from "./compress-utils";
import { validatePdfFile } from "./compress-validation";

const engines: Record<ProcessingMethod, PdfCompressionEngine> = {
  local: localEngine,
  cloud: localEngine,
};

export function useCompressWorkspace() {
  const [status, setStatus] = useState<CompressStatus>("idle");
  const [doc, setDoc] = useState<SourceDocument | null>(null);
  const [mode, setMode] = useState<CompressionMode>("recommended");
  const [custom, setCustom] = useState<CompressionSettings>(DEFAULT_CUSTOM_SETTINGS);
  const [method, setMethod] = useState<ProcessingMethod>("local");
  const [progress, setProgress] = useState<CompressProgress | null>(null);
  const [result, setResult] = useState<CompressResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const loadToken = useRef(0);

  useEffect(() => () => abortRef.current?.abort(), []);

  const loadFile = useCallback(async (file: File) => {
    const token = ++loadToken.current;
    setError(null);
    setNotice(null);
    setResult(null);
    setStatus("validating");
    try {
      await validatePdfFile(file);
      if (token !== loadToken.current) return;
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { updateMetadata: false, ignoreEncryption: false });
      if (token !== loadToken.current) return;
      const pageCount = pdf.getPageCount();
      setDoc({ id: createId("doc"), file, name: file.name, size: file.size, pageCount });
      setStatus("ready");
    } catch (caught) {
      if (token !== loadToken.current) return;
      setError(toErrorMessage(caught));
      setStatus(doc ? "ready" : "idle");
    }
  }, [doc]);

  const removeFile = useCallback(() => {
    abortRef.current?.abort();
    loadToken.current += 1;
    setDoc(null);
    setResult(null);
    setError(null);
    setNotice(null);
    setProgress(null);
    setStatus("idle");
  }, []);

  const resolvedSettings = useMemo(() => resolveSettings(mode, custom), [mode, custom]);
  const engine = engines[method];

  const canCompress = status === "ready" && doc !== null && engine.supportedModes.includes(mode);

  const startCompress = useCallback(async () => {
    if (!doc || !canCompress) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setNotice(null);
    setResult(null);
    setProgress({ stage: "preparing", completed: 0, total: 3 });
    setStatus("processing");

    try {
      const output = await engine.compress({
        file: doc.file,
        mode,
        settings: resolvedSettings,
        onProgress: setProgress,
        signal: controller.signal,
      });

      setStatus("validating-result");
      const blob = new Blob([output.bytes], { type: "application/pdf" });
      const { PDFDocument } = await import("pdf-lib");
      const verify = await PDFDocument.load(new Uint8Array(await blob.arrayBuffer()), { updateMetadata: false });
      if (verify.getPageCount() !== output.pageCount || output.pageCount !== doc.pageCount) {
        throw new CompressError("invalid-output", "The compressed PDF didn't match the original page count.");
      }

      const comparison = compareSizes(doc.size, blob.size);
      const filename = sanitizeFilename(doc.name.replace(/\.pdf$/i, "") + "-compressed");
      const nextResult: CompressResult = {
        id: createId("out"),
        blob,
        filename,
        size: blob.size,
        pageCount: output.pageCount,
        originalSize: doc.size,
        bytesSaved: comparison.bytesSaved,
        reductionPercentage: comparison.reductionPercentage,
        mode,
        method,
        lossy: !engine.losslessOnly,
      };
      setResult(nextResult);
      setStatus(comparison.isReduced ? "completed" : "no-reduction");
    } catch (caught) {
      if (caught instanceof CompressError && caught.code === "cancelled") {
        setStatus("cancelled");
      } else {
        setError(toErrorMessage(caught));
        setStatus("failed");
      }
    } finally {
      setProgress(null);
      abortRef.current = null;
    }
  }, [doc, canCompress, engine, mode, resolvedSettings, method]);

  const cancelCompress = useCallback(() => abortRef.current?.abort(), []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    loadToken.current += 1;
    setDoc(null);
    setResult(null);
    setError(null);
    setNotice(null);
    setProgress(null);
    setStatus("idle");
    setMode("recommended");
    setCustom(DEFAULT_CUSTOM_SETTINGS);
    setMethod("local");
  }, []);

  const backToEditing = useCallback(() => {
    setResult(null);
    setError(null);
    setNotice(null);
    setStatus(doc ? "ready" : "idle");
  }, [doc]);

  const download = useCallback(() => {
    if (!result) return;
    import("./compress-download").then(({ downloadBlob }) => {
      downloadBlob(result.blob, result.filename);
      setNotice(`Download started: ${result.filename}. Check your browser's Downloads.`);
    });
  }, [result]);

  return {
    status, doc, mode, custom, method, progress, result, error, notice, resolvedSettings,
    canCompress,
    setMode, setCustom, setMethod,
    loadFile, removeFile, startCompress, cancelCompress, reset, backToEditing, download,
  };
}

export type CompressWorkspaceState = ReturnType<typeof useCompressWorkspace>;