"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { SPLIT_CONFIG, SPLIT_ZIP_FILENAME } from "./split-constants";
import { createZipBlob, downloadBlob } from "./split-download";
import { destroyPdf, openPdfForPreview, runSplit, type SplitJob } from "./split-pdf";
import { buildSplitPlan } from "./split-planner";
import type {
  PageRangeInput,
  SourceDocument,
  SplitMethod,
  SplitOutput,
  SplitProgress,
  SplitStatus,
} from "./split-types";
import { SplitError, createId, defaultRanges, toErrorMessage } from "./split-utils";
import { validatePdfFile } from "./split-validation";

export function useSplitWorkspace() {
  const [status, setStatus] = useState<SplitStatus>("empty");
  const [doc, setDoc] = useState<SourceDocument | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [selected, setSelected] = useState<ReadonlySet<number>>(() => new Set());
  const [method, setMethod] = useState<SplitMethod>("selected-pages");
  const [ranges, setRanges] = useState<PageRangeInput[]>([]);
  const [equalParts, setEqualParts] = useState("2");
  const [progress, setProgress] = useState<SplitProgress | null>(null);
  const [outputs, setOutputs] = useState<SplitOutput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const jobRef = useRef<SplitJob | null>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const zipRef = useRef<Blob | null>(null);
  const loadToken = useRef(0);

  useEffect(
    () => () => {
      jobRef.current?.cancel();
      destroyPdf(pdfRef.current);
    },
    [],
  );

  const loadFile = useCallback(async (file: File) => {
    const token = ++loadToken.current;
    setError(null);
    setStatus("loading");
    try {
      await validatePdfFile(file);
      const proxy = await openPdfForPreview(file);
      if (token !== loadToken.current) {
        destroyPdf(proxy);
        return;
      }
      if (proxy.numPages > SPLIT_CONFIG.maxPages) {
        destroyPdf(proxy);
        throw new SplitError(
          "too-many-pages",
          `This PDF has ${proxy.numPages} pages. The limit for this tool is ${SPLIT_CONFIG.maxPages} pages.`,
        );
      }
      destroyPdf(pdfRef.current);
      pdfRef.current = proxy;
      zipRef.current = null;
      setPdf(proxy);
      setDoc({ id: createId("doc"), file, name: file.name, size: file.size, pageCount: proxy.numPages });
      setSelected(new Set());
      setRanges(defaultRanges(proxy.numPages));
      setEqualParts("2");
      setOutputs([]);
      setNotice(null);
      setStatus("ready");
    } catch (caught) {
      if (token !== loadToken.current) return;
      setError(toErrorMessage(caught));
      setStatus(pdfRef.current ? "ready" : "empty");
    }
  }, []);

  const removeFile = useCallback(() => {
    loadToken.current += 1;
    jobRef.current?.cancel();
    destroyPdf(pdfRef.current);
    pdfRef.current = null;
    zipRef.current = null;
    setPdf(null);
    setDoc(null);
    setSelected(new Set());
    setOutputs([]);
    setProgress(null);
    setError(null);
    setNotice(null);
    setStatus("empty");
  }, []);

  const togglePage = useCallback((page: number) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (!doc) return;
    setSelected(new Set(Array.from({ length: doc.pageCount }, (_, i) => i + 1)));
  }, [doc]);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  const addRange = useCallback(() => {
    setRanges((current) => {
      const last = Number(current[current.length - 1]?.end);
      const start = Number.isInteger(last) && last > 0 ? String(last + 1) : "";
      return [...current, { id: createId("range"), start, end: "" }];
    });
  }, []);

  const updateRange = useCallback((id: string, field: "start" | "end", value: string) => {
    setRanges((current) => current.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }, []);

  const removeRange = useCallback((id: string) => {
    setRanges((current) => current.filter((r) => r.id !== id));
  }, []);

  const planResult = useMemo(
    () =>
      doc
        ? buildSplitPlan({ method, totalPages: doc.pageCount, selectedPages: [...selected], ranges, equalParts })
        : null,
    [doc, method, selected, ranges, equalParts],
  );

  /** Page number -> "Part n", used to label thumbnails for range / equal-part splits. */
  const assignments = useMemo(() => {
    const map = new Map<number, string>();
    if (!planResult?.ok || (method !== "page-ranges" && method !== "equal-parts")) return map;
    planResult.outputs.forEach((output, i) => {
      for (const index of output.pageIndices) map.set(index + 1, `Part ${i + 1}`);
    });
    return map;
  }, [planResult, method]);

  const startSplit = useCallback(async () => {
    if (!doc || !planResult?.ok) return;
    setError(null);
    setNotice(null);
    setOutputs([]);
    zipRef.current = null;
    setStatus("processing");
    setProgress({ stage: "preparing", completed: 0, total: planResult.outputs.length });
    try {
      const buffer = await doc.file.arrayBuffer();
      const job = runSplit(buffer, planResult.outputs, setProgress);
      jobRef.current = job;
      const result = await job.promise;
      setOutputs(result);
      setStatus("done");
    } catch (caught) {
      if (!(caught instanceof SplitError && caught.code === "cancelled")) setError(toErrorMessage(caught));
      setStatus("ready");
    } finally {
      jobRef.current = null;
      setProgress(null);
    }
  }, [doc, planResult]);

  const cancelSplit = useCallback(() => jobRef.current?.cancel(), []);

  const backToEditing = useCallback(() => {
    setOutputs([]);
    setError(null);
    setNotice(null);
    zipRef.current = null;
    setStatus("ready");
  }, []);

  const downloadOne = useCallback((output: SplitOutput) => {
    downloadBlob(output.blob, output.filename);
    setNotice(`Download started: ${output.filename}. Check your browser's Downloads.`);
  }, []);

  const downloadAll = useCallback(async () => {
    setError(null);
    setNotice(null);
    try {
      let blob = zipRef.current;
      if (!blob) {
        setZipping(true);
        blob = await createZipBlob(outputs);
        zipRef.current = blob; // later clicks download instantly
      }
      downloadBlob(blob, SPLIT_ZIP_FILENAME);
      setNotice(`Download started: ${SPLIT_ZIP_FILENAME}. Check your browser's Downloads.`);
    } catch {
      setError("We couldn't create the ZIP file. You can still download each PDF individually.");
    } finally {
      setZipping(false);
    }
  }, [outputs]);

  return {
    status, doc, pdf, selected, method, ranges, equalParts, progress, outputs, error, zipping, notice,
    planResult, assignments,
    loadFile, removeFile, togglePage, selectAll, clearSelection, setMethod,
    addRange, updateRange, removeRange, setEqualParts,
    startSplit, cancelSplit, backToEditing, downloadOne, downloadAll,
  };
}

export type SplitWorkspaceState = ReturnType<typeof useSplitWorkspace>;