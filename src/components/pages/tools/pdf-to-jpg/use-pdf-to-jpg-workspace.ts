"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { PDF_TO_JPG_CONFIG } from "./pdf-to-jpg-config";
import type { ConversionSettings, ConversionStatus, ConversionResult, SourceDocument } from "./pdf-to-jpg-types";
import { PdfToJpgError } from "./pdf-to-jpg-utils";
import { convertPdfToJpg } from "./pdf-to-jpg-engine";
import { validatePdfFile } from "./pdf-to-jpg-validation";

export function usePdfToJpgWorkspace() {
  const [status, setStatus] = useState<ConversionStatus>("idle");
  const [doc, setDoc] = useState<SourceDocument | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [settings, setSettings] = useState<ConversionSettings>({
    quality: "high",
    resolution: 150,
    pageSelection: "all",
  });
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (pdfRef.current) void pdfRef.current.loadingTask.destroy();
    };
  }, []);

  const loadFile = useCallback(async (file: File) => {
    setError(null);
    setStatus("loading");
    try {
      await validatePdfFile(file);
      const pdfjs = await import("pdfjs-dist");
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();
      }

      const buffer = await file.arrayBuffer();
      const proxy = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;

      if (proxy.numPages > PDF_TO_JPG_CONFIG.maxPages) {
        throw new PdfToJpgError(`Document exceeds ${PDF_TO_JPG_CONFIG.maxPages} page limit.`);
      }

      if (pdfRef.current) void pdfRef.current.loadingTask.destroy();
      pdfRef.current = proxy;
      setPdf(proxy);
      setDoc({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        pageCount: proxy.numPages,
      });
      setSelectedPages(new Set(Array.from({ length: proxy.numPages }, (_, i) => i + 1)));
      setStatus("ready");
    } catch (err: any) {
      if (pdfRef.current) void pdfRef.current.loadingTask.destroy();
      pdfRef.current = null;
      setPdf(null);
      setDoc(null);
      setError(err.message || "Failed to load PDF.");
      setStatus("idle");
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    if (pdfRef.current) void pdfRef.current.loadingTask.destroy();
    pdfRef.current = null;
    setPdf(null);
    setDoc(null);
    setResult(null);
    setError(null);
    setStatus("idle");
  }, []);

  const startConversion = useCallback(async () => {
    if (!pdf || !doc) return;

    let pagesToConvert: number[] = [];
    if (settings.pageSelection === "all") {
      pagesToConvert = Array.from({ length: doc.pageCount }, (_, i) => i + 1);
    } else {
      pagesToConvert = Array.from(selectedPages).sort((a, b) => a - b);
    }

    if (pagesToConvert.length === 0) {
      setError("Please select at least one page.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setResult(null);
    setStatus("processing");
    setProgress({ current: 0, total: pagesToConvert.length });

    try {
      const res = await convertPdfToJpg(
        pdf,
        doc.name.replace(/\.pdf$/i, ""),
        pagesToConvert,
        settings,
        (p) => setProgress({ current: p.currentPage, total: p.totalPages }),
        controller.signal
      );
      setResult(res);
      setStatus("success");
    } catch (err: any) {
      if (err.message === "Conversion cancelled.") {
        setStatus("ready");
      } else {
        setError(err.message);
        setStatus("error");
      }
    } finally {
      setProgress(null);
      abortRef.current = null;
    }
  }, [pdf, doc, settings, selectedPages]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    status, doc, pdf, settings, selectedPages, progress, result, error,
    setSettings, setSelectedPages,
    loadFile, reset, startConversion, cancel,
  };
}