"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircleIcon,
  PdfFileIcon,
  RefreshIcon,
  TrashIcon,
} from "@/components/general/icons/pdf-icons";
import { formatBytes } from "./pdf-to-powerpoint-utils";

interface Props {
  file: File;
  pageCount: number;
  disabled: boolean;
  onReplace: (file: File) => void;
  onRemove: () => void;
}

export function PdfToPowerpointFileCard({ file, pageCount, disabled, onReplace, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <PdfFileIcon className="size-6" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatBytes(file.size)} · {pageCount} {pageCount === 1 ? "page" : "pages"}
          </p>
        </div>
      </div>
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
        <CheckCircleIcon className="size-4" />
        File ready
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={disabled} onClick={() => inputRef.current?.click()}>
          <RefreshIcon className="size-4" />
          Replace
        </Button>
        <Button variant="outline" size="sm" disabled={disabled} onClick={onRemove} className="text-destructive">
          <TrashIcon className="size-4" />
          Remove
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        onChange={(e) => {
          const next = e.target.files?.[0];
          if (next) onReplace(next);
          e.target.value = "";
        }}
      />
    </div>
  );
}
