"use client";
// src/components/pages/tools/annotate-pdf/annotate-pdf-toolbar.tsx
import {
  ArrowRightIcon,
  DownloadIcon,
  FileIcon,
  LoaderIcon,
  MoreHorizontalIcon,
  RedoIcon,
  UndoIcon,
} from "@/components/general/icons/pdf-icons";

export function AnnotatePdfToolbar({
  filename,
  pageIndex,
  pageCount,
  onPrev,
  onNext,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onDownload,
  exporting,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitWidth,
}: {
  filename: string;
  pageIndex: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onDownload: () => void;
  exporting: boolean;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitWidth: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
      <div className="flex items-center gap-2 min-w-0">
        <FileIcon className="h-4 w-4 text-primary" />
        <span className="truncate text-sm font-medium">{filename}</span>
      </div>

      <div className="mx-2 hidden h-6 w-px bg-border md:block" />

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-40"
        >
          <UndoIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-40"
        >
          <RedoIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onZoomOut}
          title="Zoom out"
          className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted"
        >
          −
        </button>
        <span className="min-w-[3rem] text-center text-sm tabular-nums">{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          onClick={onZoomIn}
          title="Zoom in"
          className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted"
        >
          +
        </button>
        <button
          type="button"
          onClick={onFitWidth}
          className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
        >
          Fit
        </button>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center gap-1 text-sm tabular-nums">
          <button
            type="button"
            onClick={onPrev}
            className="rounded-md px-2 py-1 hover:bg-muted disabled:opacity-40"
            disabled={pageIndex === 0}
            aria-label="Previous page"
          >
            <ArrowRightIcon className="h-4 w-4 rotate-180" />
          </button>
          <span>
            {pageIndex + 1} / {pageCount}
          </span>
          <button
            type="button"
            onClick={onNext}
            className="rounded-md px-2 py-1 hover:bg-muted disabled:opacity-40"
            disabled={pageIndex >= pageCount - 1}
            aria-label="Next page"
          >
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={onDownload}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {exporting ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <DownloadIcon className="h-4 w-4" />}
          {exporting ? "Exporting…" : "Download PDF"}
        </button>
      </div>
    </div>
  );
}