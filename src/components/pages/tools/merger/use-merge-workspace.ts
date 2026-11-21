import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_OUTPUT_NAME, MIN_FILES_TO_MERGE } from "./merge-constants";
import { createPdfDownload } from "./merge-download";
import { MergeFailure, inspectFiles, mergeFiles } from "./merge-pdf";
import type { InspectHandle, MergeHandle } from "./merge-pdf";
import type {
  MergeFileItem,
  MergeIssue,
  MergePhase,
  MergeProgress,
  MergeResult,
} from "./merge-types";
import { describeMergeError, sanitizeOutputName } from "./merge-utils";
import { screenIncomingFiles } from "./merge-validation";

/**
 * All merge-tool state and actions live here, so components stay presentational.
 * Files only ever exist in browser memory.
 */
export function useMergeWorkspace() {
  const [files, setFiles] = useState<MergeFileItem[]>([]);
  const [issues, setIssues] = useState<MergeIssue[]>([]);
  const [phase, setPhase] = useState<MergePhase>("idle");
  const [progress, setProgress] = useState<MergeProgress | null>(null);
  const [result, setResult] = useState<MergeResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [outputName, setOutputName] = useState(DEFAULT_OUTPUT_NAME);
  const [isScreening, setIsScreening] = useState(false);

  const filesRef = useRef<MergeFileItem[]>([]);
  const inspectHandles = useRef(new Set<InspectHandle>());
  const mergeHandle = useRef<MergeHandle | null>(null);
  const revokeResult = useRef<(() => void) | null>(null);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  const releaseResult = useCallback(() => {
    revokeResult.current?.();
    revokeResult.current = null;
  }, []);

  // Cleanup on unmount: stop workers and free the download URL.
  useEffect(() => {
    const handles = inspectHandles.current;
    return () => {
      mergeHandle.current?.cancel();
      handles.forEach((handle) => handle.terminate());
      revokeResult.current?.();
      revokeResult.current = null;
    };
  }, []);

  const addIssue = useCallback((fileName: string, message: string) => {
    setIssues((prev) => [
      ...prev,
      { id: crypto.randomUUID(), fileName, message },
    ]);
  }, []);

  const addFiles = useCallback(
    async (incoming: File[]) => {
      if (incoming.length === 0) return;

      setIsScreening(true);
      const current = filesRef.current;
      const { accepted, rejected } = await screenIncomingFiles(incoming, {
        count: current.length,
        totalSize: current.reduce((sum, item) => sum + item.file.size, 0),
      });
      setIsScreening(false);

      rejected.forEach((item) => addIssue(item.fileName, item.message));
      if (accepted.length === 0) return;

      const items: MergeFileItem[] = accepted.map((file) => ({
        id: crypto.randomUUID(),
        file,
        pageCount: null,
      }));
      setFiles((prev) => [...prev, ...items]);

      const handle = inspectFiles(
        items.map(({ id, file }) => ({ id, file })),
        (inspected) => {
          if (inspected.ok) {
            setFiles((prev) =>
              prev.map((item) =>
                item.id === inspected.id
                  ? { ...item, pageCount: inspected.pageCount }
                  : item,
              ),
            );
            return;
          }
          const failed = items.find((item) => item.id === inspected.id);
          setFiles((prev) => prev.filter((item) => item.id !== inspected.id));
          addIssue(
            failed?.file.name ?? "A file",
            describeMergeError(inspected.code),
          );
        },
      );

      inspectHandles.current.add(handle);
      void handle.promise.finally(() => inspectHandles.current.delete(handle));
    },
    [addIssue],
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const moveFile = useCallback((from: number, to: number) => {
    setFiles((prev) => {
      if (
        from === to ||
        from < 0 ||
        to < 0 ||
        from >= prev.length ||
        to >= prev.length
      ) {
        return prev;
      }
      const next = prev.slice();
      const [moved] = next.splice(from, 1);
      if (!moved) return prev;
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setIssues([]);
  }, []);

  const dismissIssue = useCallback((id: string) => {
    setIssues((prev) => prev.filter((issue) => issue.id !== id));
  }, []);

  const dismissAllIssues = useCallback(() => setIssues([]), []);

  const commitOutputName = useCallback(() => {
    setOutputName((value) => sanitizeOutputName(value));
  }, []);

  const startMerge = useCallback(async () => {
    if (mergeHandle.current) return; // prevent duplicate runs

    // Snapshot the order the user sees at this moment.
    const snapshot = filesRef.current;
    if (
      snapshot.length < MIN_FILES_TO_MERGE ||
      snapshot.some((item) => item.pageCount === null)
    ) {
      return;
    }

    const fileName = sanitizeOutputName(outputName);
    setPhase("processing");
    setErrorMessage(null);
    setProgress({ stage: "preparing", completed: 0, total: snapshot.length });

    const handle = mergeFiles(
      snapshot.map(({ id, file }) => ({ id, file })),
      setProgress,
    );
    mergeHandle.current = handle;

    try {
      const output = await handle.promise;
      const download = createPdfDownload(output.buffer);
      releaseResult();
      revokeResult.current = download.revoke;
      setResult({
        url: download.url,
        fileName,
        pageCount: output.pageCount,
        sizeBytes: output.buffer.byteLength,
      });
      setPhase("success");
    } catch (error) {
      if (error instanceof MergeFailure && error.code === "cancelled") {
        setPhase("idle");
      } else {
        const code = error instanceof MergeFailure ? error.code : "failed";
        const failedName = error instanceof MergeFailure && error.fileId
          ? snapshot.find((item) => item.id === error.fileId)?.file.name
          : undefined;
        setErrorMessage(describeMergeError(code, failedName));
        setPhase("error");
      }
    } finally {
      mergeHandle.current = null;
      setProgress(null);
    }
  }, [outputName, releaseResult]);

  const cancelMerge = useCallback(() => {
    mergeHandle.current?.cancel();
  }, []);

  /** Keeps the user's files so they can retry or change something. */
  const backToEditing = useCallback(() => {
    setErrorMessage(null);
    setPhase("idle");
  }, []);

  /** Starts over with an empty workspace. */
  const reset = useCallback(() => {
    releaseResult();
    setFiles([]);
    setIssues([]);
    setResult(null);
    setErrorMessage(null);
    setProgress(null);
    setOutputName(DEFAULT_OUTPUT_NAME);
    setPhase("idle");
  }, [releaseResult]);

  const totals = useMemo(() => {
    let pages = 0;
    let size = 0;
    let inspecting = false;
    for (const item of files) {
      size += item.file.size;
      if (item.pageCount === null) inspecting = true;
      else pages += item.pageCount;
    }
    return { pages, size, inspecting };
  }, [files]);

  const canMerge =
    phase === "idle" &&
    !totals.inspecting &&
    files.length >= MIN_FILES_TO_MERGE;

  const announcement =
    phase === "processing"
      ? "Merging your PDF files."
      : phase === "success"
        ? "Your merged PDF is ready to download."
        : phase === "error" && errorMessage
          ? errorMessage
          : "";

  return {
    files,
    issues,
    phase,
    progress,
    result,
    errorMessage,
    outputName,
    isScreening,
    totalPages: totals.pages,
    totalSize: totals.size,
    isInspecting: totals.inspecting,
    canMerge,
    announcement,
    setOutputName,
    commitOutputName,
    addFiles,
    removeFile,
    moveFile,
    clearFiles,
    dismissIssue,
    dismissAllIssues,
    startMerge,
    cancelMerge,
    backToEditing,
    reset,
  };
}