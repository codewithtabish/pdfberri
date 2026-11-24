"use client";
// src/components/pages/tools/annotate-pdf/annotate-pdf-workspace.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnnotatePdfLeftToolbar } from "./annotate-pdf-left-toolbar";
import { AnnotatePdfPage } from "./annotate-pdf-page";
import { AnnotatePdfPropertiesPanel } from "./annotate-pdf-properties-panel";
import { AnnotatePdfToolbar } from "./annotate-pdf-toolbar";
import { AnnotatePdfUpload } from "./annotate-pdf-upload";
import {
  DEFAULT_SETTINGS,
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_STEP,
} from "./annotate-pdf-constants";
import { destroyDoc, loadPdf, type LoadedDoc } from "./annotate-pdf-engine";
import { exportAnnotatedPdf } from "./annotate-pdf-export";
import { AnnotationHistory } from "./annotate-pdf-history";
import type {
  Annotation,
  Status,
  ToolId,
  ToolSettings,
} from "./annotate-pdf-types";
import { downloadBlob } from "./annotate-pdf-utils";

export function AnnotatePdfWorkspace() {
  const [status, setStatus] = useState<Status>("empty");
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<LoadedDoc | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(1.1);
  const [tool, setTool] = useState<ToolId>("select");
  const [settings, setSettings] = useState<ToolSettings>(DEFAULT_SETTINGS);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const historyRef = useRef(new AnnotationHistory());

  // Load file
  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setStatus("loading");
      destroyDoc(loaded);
      try {
        const l = await loadPdf(file);
        setLoaded(l);
        setPageIndex(0);
        setAnnotations([]);
        setSelectedId(null);
        historyRef.current.reset([]);
        setCanUndo(false);
        setCanRedo(false);
        setStatus("ready");
      } catch (e) {
        const code = e instanceof Error ? e.message : "LOAD_FAILED";
        const message =
          code === "PASSWORD_PROTECTED"
            ? "This PDF is password-protected. Please remove the password and try again."
            : code === "INVALID_PDF"
            ? "This file is not a valid PDF."
            : code === "MISSING_PDF"
            ? "The file could not be read."
            : "Could not open this PDF. Please open the browser console for details.";
        setError(message);
        setStatus("error");
      }
    },
    [loaded]
  );

  // Release pdf.js resources on unmount
  useEffect(() => {
    return () => {
      destroyDoc(loaded);
    };
  }, [loaded]);

  const commit = useCallback(
    (a: Annotation) => {
      const next = [...annotations, a];
      setAnnotations(next);
      historyRef.current.push(next);
      setCanUndo(historyRef.current.canUndo);
      setCanRedo(false);
    },
    [annotations]
  );

  const erase = useCallback(
    (id: string) => {
      const next = annotations.filter((a) => a.id !== id);
      setAnnotations(next);
      historyRef.current.push(next);
      setCanUndo(historyRef.current.canUndo);
      setCanRedo(false);
      if (selectedId === id) setSelectedId(null);
    },
    [annotations, selectedId]
  );

  const undo = useCallback(() => {
    const s = historyRef.current.undo();
    if (s) {
      setAnnotations(s);
      setCanUndo(historyRef.current.canUndo);
      setCanRedo(historyRef.current.canRedo);
      setSelectedId(null);
    }
  }, []);

  const redo = useCallback(() => {
    const s = historyRef.current.redo();
    if (s) {
      setAnnotations(s);
      setCanUndo(historyRef.current.canUndo);
      setCanRedo(historyRef.current.canRedo);
      setSelectedId(null);
    }
  }, []);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    erase(selectedId);
  }, [selectedId, erase]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      )
        return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) {
          e.preventDefault();
          deleteSelected();
        }
      } else if (e.key === "Escape") {
        setSelectedId(null);
        setTool("select");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, deleteSelected, selectedId]);

  const onDownload = useCallback(async () => {
    if (!loaded) return;
    setExporting(true);
    try {
      const { blob, filename } = await exportAnnotatedPdf(loaded, annotations);
      downloadBlob(blob, filename);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }, [loaded, annotations]);

  const currentSelected = useMemo(
    () => annotations.find((a) => a.id === selectedId) ?? null,
    [annotations, selectedId]
  );

  if (status === "empty" || status === "error" || !loaded) {
    return (
      <div className="mx-auto w-full max-w-5xl py-4">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Annotate PDF
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
            Highlight text, draw, add comments, and mark up your PDF documents
            with ease.
          </p>
        </header>
        <AnnotatePdfUpload onFile={handleFile} error={error} />
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading PDF…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AnnotatePdfToolbar
        filename={loaded.name}
        pageIndex={pageIndex}
        pageCount={loaded.doc.numPages}
        onPrev={() => setPageIndex((i) => Math.max(0, i - 1))}
        onNext={() =>
          setPageIndex((i) => Math.min(loaded.doc.numPages - 1, i + 1))
        }
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onDownload={onDownload}
        exporting={exporting}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
        onZoomOut={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
        onFitWidth={() => setZoom(1.1)}
      />

      <div className="flex gap-3">
        <AnnotatePdfLeftToolbar active={tool} onChange={setTool} />

        <div className="flex-1 overflow-auto rounded-xl border border-border bg-muted/30 p-4">
          <AnnotatePdfPage
            pdf={loaded.doc}
            pageIndex={pageIndex}
            zoom={zoom}
            tool={tool}
            settings={settings}
            annotations={annotations}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onCommit={commit}
            onErase={erase}
          />
        </div>

        <AnnotatePdfPropertiesPanel
          tool={tool}
          settings={settings}
          onSettingsChange={(s) => setSettings((prev) => ({ ...prev, ...s }))}
          selected={currentSelected}
          onDeleteSelected={deleteSelected}
        />
      </div>
    </div>
  );
}