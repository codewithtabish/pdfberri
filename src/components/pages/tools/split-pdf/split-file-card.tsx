"use client";

import { useRef } from "react";
import { SPLIT_UI } from "./split-constants";
import type { SourceDocument } from "./split-types";
import { formatBytes } from "./split-utils";
import { PdfFileIcon, RefreshIcon, TrashIcon } from "@/components/general/icons/pdf-icons";

interface SplitFileCardProps {
  doc: SourceDocument;
  disabled: boolean;
  onReplace: (file: File) => void;
  onRemove: () => void;
}

export function SplitFileCard({ doc, disabled, onReplace, onRemove }: SplitFileCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <PdfFileIcon className="size-6" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground" title={doc.name}>
            {doc.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {doc.pageCount} {doc.pageCount === 1 ? "page" : "pages"} · {formatBytes(doc.size)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button type="button" disabled={disabled} onClick={() => inputRef.current?.click()} className={SPLIT_UI.textButton}>
          <RefreshIcon className="size-4" />
          Replace file
        </button>
        <button type="button" disabled={disabled} onClick={onRemove} className={SPLIT_UI.dangerButton}>
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
