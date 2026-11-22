"use client";

import { useRef } from "react";
import { usePdfToJpgWorkspace } from "./use-pdf-to-jpg-workspace";
import { PdfToJpgUploadZone } from "./pdf-to-jpg-upload-zone";
import { PdfToJpgPageCard } from "./pdf-to-jpg-page-card";
import { PdfToJpgSettings } from "./pdf-to-jpg-settings";
import { PdfToJpgResults } from "./pdf-to-jpg-results";
import { formatBytes } from "./pdf-to-jpg-utils";
import { AlertCircleIcon, LoaderIcon, PdfFileIcon, TrashIcon, ImageIcon, XIcon } from "@/components/general/icons/pdf-icons";

export function PdfToJpgWorkspace() {
  const w = usePdfToJpgWorkspace();

  if (!w.doc) {
    return <PdfToJpgUploadZone loading={w.status === "loading"} error={w.error} onFile={w.loadFile} />;
  }

  const isProcessing = w.status === "processing";

  return (
    <div className="space-y-6">
      {/* Document Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <PdfFileIcon className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-foreground">{w.doc.name}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(w.doc.size)} • {w.doc.pageCount} pages</p>
          </div>
        </div>
        <button onClick={w.reset} disabled={isProcessing} className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive hover:underline disabled:opacity-50">
          <TrashIcon className="size-4" /> Remove
        </button>
      </div>

      {w.status === "success" && w.result ? (
        <PdfToJpgResults result={w.result} onReset={w.reset} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Left: Page Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">Page Selection</h2>
              <div className="flex gap-2 text-xs">
                <button onClick={() => w.setSelectedPages(new Set(Array.from({ length: w.doc!.pageCount }, (_, i) => i + 1)))} className="text-primary hover:underline">Select All</button>
                <button onClick={() => w.setSelectedPages(new Set())} className="text-muted-foreground hover:underline">Clear</button>
              </div>
            </div>
            <div className="grid max-h-[30rem] grid-cols-2 gap-3 overflow-y-auto overscroll-contain p-1 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: w.doc.pageCount }).map((_, i) => (
                <PdfToJpgPageCard
                  key={i}
                  pdf={w.pdf!}
                  pageIndex={i}
                  selected={w.selectedPages.has(i + 1)}
                  interactive={w.settings.pageSelection === "selected" && !isProcessing}
                  onToggle={(index) => {
                    const next = new Set(w.selectedPages);
                    if (next.has(index + 1)) next.delete(index + 1);
                    else next.add(index + 1);
                    w.setSelectedPages(next);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right: Settings & Action */}
          <div className="space-y-6 rounded-xl border border-border bg-card p-4">
            <PdfToJpgSettings
              settings={w.settings}
              onChange={w.setSettings}
              disabled={isProcessing}
              selectedCount={w.selectedPages.size}
            />

            {w.error && w.status === "error" && (
              <p role="alert" className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertCircleIcon className="size-4 shrink-0" /> {w.error}
              </p>
            )}

            {isProcessing ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-semibold text-primary">
                  <span className="flex items-center gap-2"><LoaderIcon className="size-4 animate-spin" /> Processing…</span>
                  <span>{w.progress?.current} / {w.progress?.total}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-primary/20">
                  <div className="h-full bg-primary transition-all" style={{ width: `${(w.progress?.current || 0) / (w.progress?.total || 1) * 100}%` }} />
                </div>
                <button onClick={w.cancel} className="inline-flex w-full h-10 items-center justify-center gap-2 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted">
                  <XIcon className="size-4" /> Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={w.startConversion}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
                disabled={w.settings.pageSelection === "selected" && w.selectedPages.size === 0}
              >
                <ImageIcon className="size-5" /> Convert to JPG
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}