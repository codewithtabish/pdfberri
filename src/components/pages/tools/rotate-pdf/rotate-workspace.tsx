"use client";

import { cn } from "@/lib/utils";
import { useRotateWorkspace } from "./use-rotate-workspace";
import { RotatePageGrid } from "./rotate-page-grid";
import { formatBytes } from "./rotate-utils";
import {
  AlertCircleIcon, CheckCircleIcon, DownloadIcon, LoaderIcon,
  PdfFileIcon, RefreshIcon, RotateCcwIcon, RotateCwIcon, TrashIcon, UploadIcon, XIcon
} from "@/components/general/icons/pdf-icons";

export function RotateWorkspace() {
  const w = useRotateWorkspace();
  const hasSelection = w.selected.size > 0;
  const processing = w.status === "processing";

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {!w.doc && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 px-4 py-14 text-center sm:py-20">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-card text-primary shadow-sm ring-1 ring-border">
            {w.status === "loading" ? (
              <LoaderIcon className="size-8 animate-spin" />
            ) : (
              <PdfFileIcon className="size-8" />
            )}
          </span>
          <div>
            <p className="text-lg font-bold text-foreground">{w.status === "loading" ? "Reading PDF…" : "Drop your PDF here."}</p>
            <p className="text-sm text-muted-foreground">Rotate pages directly in your browser.</p>
          </div>
          <button
            type="button"
            onClick={() => document.getElementById("rotate-upload")?.click()}
            disabled={w.status === "loading"}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
          >
            <UploadIcon className="size-5" />
            Select PDF
          </button>
          <input
            id="rotate-upload"
            type="file"
            accept=".pdf,application/pdf"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) w.loadFile(file);
              e.target.value = "";
            }}
          />
          <p className="text-xs text-muted-foreground">Accepted format:- PDF</p>
        </div>
      )}

      {w.error && !w.doc && (
        <p role="alert" className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircleIcon className="size-5 shrink-0" />
          {w.error}
        </p>
      )}

      {/* Workspace */}
      {w.doc && w.pdf && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 sm:p-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <PdfFileIcon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">{w.doc.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(w.doc.size)} • {w.doc.pageCount} pages</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={w.removeFile} disabled={processing} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50">
                <TrashIcon className="size-4" /> Remove
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-2 sm:p-3">
            <div className="flex flex-wrap items-center gap-1">
              <button onClick={() => w.rotateSelected(90)} disabled={!hasSelection || processing} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-foreground hover:bg-primary/10 disabled:opacity-50">
                <RotateCwIcon className="size-4" /> Rotate 90° CW
              </button>
              <button onClick={() => w.rotateSelected(270)} disabled={!hasSelection || processing} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-foreground hover:bg-primary/10 disabled:opacity-50">
                <RotateCcwIcon className="size-4" /> Rotate 90° CCW
              </button>
              <button onClick={() => w.rotateSelected(180)} disabled={!hasSelection || processing} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-foreground hover:bg-primary/10 disabled:opacity-50">
                <RefreshIcon className="size-4" /> 180°
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={w.selectAll} disabled={processing} className="text-xs font-semibold text-primary hover:underline">Select All</button>
              <button onClick={w.clearSelection} disabled={processing || !hasSelection} className="text-xs font-semibold text-muted-foreground hover:underline">Deselect</button>
            </div>
          </div>

          {/* Grid */}
          <RotatePageGrid pdf={w.pdf} pages={w.pages} selected={w.selected} interactive={!processing} onToggle={w.togglePage} />

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 sm:p-4">
            <p className="text-sm font-semibold text-foreground">{w.selected.size} pages selected</p>
            <div className="flex items-center gap-2">
              {processing ? (
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <LoaderIcon className="size-4 animate-spin" /> Processing…
                </div>
              ) : w.output ? (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-chart-2">
                    <CheckCircleIcon className="size-4" /> Ready
                  </span>
                  <button onClick={w.download} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                    <DownloadIcon className="size-4" /> Download PDF
                  </button>
                  <button onClick={w.resetWorkspace} className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm font-semibold hover:bg-primary/5">
                    Rotate Another
                  </button>
                </div>
              ) : (
                <button onClick={w.startExport} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  <RotateCwIcon className="size-4" /> Apply Changes & Export
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}