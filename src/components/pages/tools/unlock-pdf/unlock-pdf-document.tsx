"use client";

import { PdfFileIcon, RefreshIcon, TrashIcon, LockIcon } from "@/components/general/icons/pdf-icons";
import { formatFileSize, formatPageCount } from "./unlock-pdf.utils";

interface UnlockPdfDocumentProps {
  file: File;
  pageCount: number | null;
  onRemove: () => void;
  onReplace: () => void;
}

export function UnlockPdfDocument({ file, pageCount, onRemove, onReplace }: UnlockPdfDocumentProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row">
      <div className="flex w-full items-center gap-3 overflow-hidden sm:w-auto">
        <div className="shrink-0 rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
          <PdfFileIcon className="h-7 w-7 text-red-600 dark:text-red-400" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatFileSize(file.size)}</span>
            <span>•</span>
            <span>{pageCount ? formatPageCount(pageCount) : "Analyzing..."}</span>
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-end gap-2 border-t border-border pt-3 sm:w-auto sm:border-0 sm:pt-0">
        <div className="mr-auto flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-400 sm:mr-2">
          <LockIcon className="h-3.5 w-3.5" />
          <span>Password-protected</span>
        </div>
        <button
          type="button"
          onClick={onReplace}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Replace file"
        >
          <RefreshIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
          aria-label="Remove file"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}