"use client";

import { useRef } from "react";
import { formatBytes } from "./compress-utils";
import type { SourceDocument } from "./compress-types";
import { PdfFileIcon, RefreshIcon, TrashIcon } from "@/components/general/icons/pdf-icons";

interface CompressFileCardProps {
  doc: SourceDocument;
  disabled: boolean;
  onReplace: (file: File) => void;
  onRemove: () => void;
}

export function CompressFileCard({ doc, disabled, onReplace, onRemove }: CompressFileCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 sm:p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <PdfFileIcon className="size-6" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground" title={doc.name}>{doc.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatBytes(doc.size)} · {doc.pageCount} {doc.pageCount === 1 ? "page" : "pages"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RefreshIcon className="size-4" />
          Replace
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onRemove}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <TrashIcon className="size-4" />
          Remove
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="sr-only"
          tabIndex={-1}
          aria-label="Choose a replacement PDF"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onReplace(file);
            event.target.value = "";
          }}
        />
      </div>
    </div>
  );
}