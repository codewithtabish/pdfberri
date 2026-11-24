"use client";
import { DownloadIcon, LoaderIcon, ArrowRightIcon, FileIcon } from "@/components/general/icons/pdf-icons";
export function SignPdfToolbar({ filename, pageIndex, pageCount, zoom, onPrevPage, onNextPage, onZoomIn, onZoomOut, onExport, isExporting }: { filename: string, pageIndex: number, pageCount: number, zoom: number, onPrevPage: () => void, onNextPage: () => void, onZoomIn: () => void, onZoomOut: () => void, onExport: () => void, isExporting: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-2">
      <div className="flex min-w-0 items-center gap-2"><FileIcon className="h-4 w-4 text-primary" /><span className="truncate text-sm font-medium">{filename}</span></div>
      <div className="mx-2 hidden h-6 w-px bg-border md:block" />
      <div className="flex items-center gap-1 text-sm">
        <button onClick={onPrevPage} disabled={pageIndex === 0} className="rounded p-1 hover:bg-muted disabled:opacity-40"><ArrowRightIcon className="h-4 w-4 rotate-180" /></button>
        <span className="tabular-nums">{pageIndex + 1} / {pageCount}</span>
        <button onClick={onNextPage} disabled={pageIndex >= pageCount - 1} className="rounded p-1 hover:bg-muted disabled:opacity-40"><ArrowRightIcon className="h-4 w-4" /></button>
      </div>
      <div className="mx-2 hidden h-6 w-px bg-border md:block" />
      <div className="flex items-center gap-1">
        <button onClick={onZoomOut} className="rounded px-2 py-1 text-sm hover:bg-muted">−</button>
        <span className="min-w-[3rem] text-center text-sm tabular-nums">{Math.round(zoom * 100)}%</span>
        <button onClick={onZoomIn} className="rounded px-2 py-1 text-sm hover:bg-muted">+</button>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button onClick={onExport} disabled={isExporting} className="inline-flex items-center gap-2 rounded bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
          {isExporting ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <DownloadIcon className="h-4 w-4" />}
          {isExporting ? "Exporting…" : "Download Signed PDF"}
        </button>
      </div>
    </div>
  );
}