"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { DEFAULT_SETTINGS, MAX_PAGES } from "./pdf-to-powerpoint-constants";
import { convertPdfToPptx } from "./pdf-to-powerpoint-engine";
import { ConverterError, toConverterError } from "./pdf-to-powerpoint-errors";
import { openPdf } from "./pdf-to-powerpoint-pdfjs";
import type {
  ConversionSettings,
  ConversionSummary,
  ProgressState,
  WorkspaceStatus,
} from "./pdf-to-powerpoint-types";
import { assertValidPdfFile, parsePageRanges } from "./pdf-to-powerpoint-validation";

// Helper type to bypass the missing 'destroy' type in pdfjs-dist
type DestroyablePDFDocumentProxy = PDFDocumentProxy & { destroy: () => Promise<void> };

export function usePdfToPowerpoint() {
  const [status, setStatus] = useState<WorkspaceStatus>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [rangeText, setRangeText] = useState("");
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ConversionSettings>(DEFAULT_SETTINGS);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [summary, setSummary] = useState<ConversionSummary | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const docRef = useRef<PDFDocumentProxy | null>(null);
  const urlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const busyRef = useRef(false);

  const revokeUrl = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setDownloadUrl(null);
  }, []);

  const invalidateResult = useCallback(() => {
    revokeUrl();
    setSummary(null);
    setStatus((current) => (current === "done" ? "ready" : current));
  }, [revokeUrl]);

  const destroyDoc = useCallback(() => {
    const current = docRef.current;
    docRef.current = null;
    if (current) void (current as DestroyablePDFDocumentProxy).destroy().catch(() => undefined);
  }, []);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const current = docRef.current;
      if (current) void (current as DestroyablePDFDocumentProxy).destroy().catch(() => undefined);
    },
    [],
  );

  const loadFile = useCallback(
    async (next: File) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setError(null);
      invalidateResult();
      setStatus("inspecting");
      try {
        await assertValidPdfFile(next);
        const opened = await openPdf(next);
        if (opened.numPages < 1) {
          void (opened as DestroyablePDFDocumentProxy).destroy();
          throw new ConverterError("EMPTY");
        }
        if (opened.numPages > MAX_PAGES) {
          void (opened as DestroyablePDFDocumentProxy).destroy();
          throw new ConverterError("TOO_MANY_PAGES");
        }
        destroyDoc();
        docRef.current = opened;
        setDoc(opened);
        setFile(next);
        setSelected(Array.from({ length: opened.numPages }, (_, i) => i));
        setRangeText("");
        setRangeError(null);
        setStatus("ready");
      } catch (e) {
        setError(toConverterError(e).message);
        setStatus(docRef.current ? "ready" : "idle");
      } finally {
        busyRef.current = false;
      }
    },
    [destroyDoc, invalidateResult],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    destroyDoc();
    revokeUrl();
    setDoc(null);
    setFile(null);
    setSelected([]);
    setSummary(null);
    setProgress(null);
    setError(null);
    setRangeText("");
    setRangeError(null);
    setStatus("idle");
  }, [destroyDoc, revokeUrl]);

  const togglePage = useCallback(
    (index: number) => {
      invalidateResult();
      setSelected((current) =>
        current.includes(index)
          ? current.filter((i) => i !== index)
          : [...current, index].sort((a, b) => a - b),
      );
    },
    [invalidateResult],
  );

  const selectAll = useCallback(() => {
    invalidateResult();
    setSelected(Array.from({ length: doc?.numPages ?? 0 }, (_, i) => i));
    setRangeError(null);
  }, [doc, invalidateResult]);

  const clearSelection = useCallback(() => {
    invalidateResult();
    setSelected([]);
  }, [invalidateResult]);

  const applyRange = useCallback(
    (text: string) => {
      setRangeText(text);
      if (!doc) return;
      const result = parsePageRanges(text, doc.numPages);
      if (!result.ok) {
        setRangeError(result.error);
        return;
      }
      setRangeError(null);
      invalidateResult();
      setSelected(result.pages);
    },
    [doc, invalidateResult],
  );

  const updateSettings = useCallback(
    (patch: Partial<ConversionSettings>) => {
      invalidateResult();
      setSettings((current) => {
        const next = { ...current, ...patch };
        if (next.mode === "editable") next.fit = "contain";
        return next;
      });
    },
    [invalidateResult],
  );

  const convert = useCallback(async () => {
    if (busyRef.current || !doc || !file) return;
    if (selected.length === 0) {
      setError(new ConverterError("NO_PAGES").message);
      return;
    }
    busyRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    setError(null);
    revokeUrl();
    setSummary(null);
    setStatus("converting");
    try {
      const output = await convertPdfToPptx({
        doc,
        fileName: file.name,
        pageIndexes: selected,
        settings,
        signal: controller.signal,
        onProgress: setProgress,
      });
      const url = URL.createObjectURL(output.blob);
      urlRef.current = url;
      setDownloadUrl(url);
      setSummary(output.summary);
      setStatus("done");
    } catch (e) {
      const converted = toConverterError(e);
      if (converted.code !== "CANCELLED") setError(converted.message);
      setStatus("ready");
    } finally {
      busyRef.current = false;
      abortRef.current = null;
      setProgress(null);
    }
  }, [doc, file, selected, settings, revokeUrl]);

  const cancel = useCallback(() => abortRef.current?.abort(), []);

  return {
    status, file, doc, selected, rangeText, rangeError, settings, progress,
    summary, downloadUrl, error,
    loadFile, reset, togglePage, selectAll, clearSelection, applyRange,
    updateSettings, convert, cancel,
    dismissError: () => setError(null),
  };
}