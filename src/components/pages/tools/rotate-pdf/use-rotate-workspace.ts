"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { processRotation } from "./rotate-engine";
import { destroyPdf, loadPdfPreview } from "./rotate-pdf";
import type { PageState, RotateOutput, RotateStatus, SourceDocument } from "./rotate-types";
import { normalizeRotation } from "./rotate-utils";
import { validatePdfFile } from "./rotate-validation";

export function useRotateWorkspace() {
  const [status, setStatus] = useState<RotateStatus>("empty");
  const [doc, setDoc] = useState<SourceDocument | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pages, setPages] = useState<PageState[]>([]);
  const [selected, setSelected] = useState<ReadonlySet<number>>(() => new Set());
  const [output, setOutput] = useState<RotateOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const loadToken = useRef(0);
  const workerRef = useRef<{ cancel: () => void } | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.cancel();
      destroyPdf(pdfRef.current);
    };
  }, []);

  const loadFile = useCallback(async (file: File) => {
    const token = ++loadToken.current;
    setError(null);
    setStatus("loading");
    try {
      await validatePdfFile(file);
      const proxy = await loadPdfPreview(file);
      if (token !== loadToken.current) {
        destroyPdf(proxy);
        return;
      }

      const pageStates: PageState[] = Array.from({ length: proxy.numPages }).map((_, i) => {
        // PDF.js getPage is async, but we just need the state initially
        // We will fetch original rotation inside the thumbnail or wait for it
        return { originalRotation: 0, currentRotation: 0 };
      });

      destroyPdf(pdfRef.current);
      pdfRef.current = proxy;
      setPdf(proxy);
      setDoc({ id: crypto.randomUUID(), file, name: file.name, size: file.size, pageCount: proxy.numPages });
      setPages(pageStates);
      setSelected(new Set());
      setOutput(null);
      setStatus("ready");
    } catch (err: any) {
      if (token !== loadToken.current) return;
      setError(err.message || "Failed to load PDF.");
      setStatus("empty");
    }
  }, []);

  const removeFile = useCallback(() => {
    loadToken.current += 1;
    workerRef.current?.cancel();
    destroyPdf(pdfRef.current);
    pdfRef.current = null;
    setPdf(null);
    setDoc(null);
    setPages([]);
    setSelected(new Set());
    setOutput(null);
    setError(null);
    setStatus("empty");
  }, []);

  const togglePage = useCallback((index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelected(new Set(Array.from({ length: pages.length }, (_, i) => i)));
  }, [pages.length]);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  const rotatePages = useCallback((indices: number[], angle: number) => {
    setPages((prev) => {
      const next = [...prev];
      indices.forEach((i) => {
        if (next[i]) {
          next[i] = { ...next[i], currentRotation: normalizeRotation(next[i].currentRotation + angle) };
        }
      });
      return next;
    });
  }, []);

  const rotateSelected = useCallback((angle: number) => {
    rotatePages(Array.from(selected), angle);
  }, [selected, rotatePages]);

  const rotateAll = useCallback((angle: number) => {
    rotatePages(Array.from({ length: pages.length }, (_, i) => i), angle);
  }, [pages.length, rotatePages]);

  const resetSelected = useCallback(() => {
    setPages((prev) => {
      const next = [...prev];
      Array.from(selected).forEach((i) => {
        if (next[i]) next[i] = { ...next[i], currentRotation: 0 };
      });
      return next;
    });
  }, [selected]);

  const resetAll = useCallback(() => {
    setPages((prev) => prev.map((p) => ({ ...p, currentRotation: 0 })));
  }, []);

  const startExport = useCallback(async () => {
    if (!doc) return;
    setError(null);
    setStatus("processing");
    setProgress({ current: 0, total: doc.pageCount });

    const rotationsMap: Record<number, number> = {};
    pages.forEach((p, i) => {
      if (p.currentRotation !== 0) rotationsMap[i] = p.currentRotation;
    });

    const handle = processRotation(doc.file, rotationsMap, (current, total) => {
      setProgress({ current, total });
    });
    workerRef.current = handle;

    try {
      const result = await handle.promise;
      setOutput(result);
      setStatus("done");
    } catch (err: any) {
      setError(err.message);
      setStatus("ready");
    } finally {
      workerRef.current = null;
      setProgress(null);
    }
  }, [doc, pages]);

  const download = useCallback(() => {
    if (!output) return;
    const url = URL.createObjectURL(output.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = output.filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const resetWorkspace = useCallback(() => {
    setOutput(null);
    setStatus("ready");
  }, []);

  return {
    status, doc, pdf, pages, selected, output, error, progress,
    loadFile, removeFile, togglePage, selectAll, clearSelection,
    rotateSelected, rotateAll, resetSelected, resetAll,
    startExport, download, resetWorkspace,
  };
}