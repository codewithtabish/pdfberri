"use client";

import { cn } from "@/lib/utils";
import { SPLIT_UI } from "./split-constants";
import { CheckIcon, XIcon } from "@/components/general/icons/pdf-icons";

interface SplitToolbarProps {
  pageCount: number;
  selectedCount: number;
  interactive: boolean;
  disabled: boolean;
  onSelectAll: () => void;
  onClear: () => void;
}

export function SplitToolbar({ pageCount, selectedCount, interactive, disabled, onSelectAll, onClear }: SplitToolbarProps) {
  if (!interactive) {
    return (
      <p className="text-sm text-muted-foreground">
        {pageCount} {pageCount === 1 ? "page" : "pages"} in this document
      </p>
    );
  }

  const allSelected = selectedCount === pageCount;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p aria-live="polite" className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-5 items-center justify-center rounded-md border text-white",
            selectedCount > 0 ? "border-primary bg-primary" : "border-border bg-card",
          )}
        >
          {selectedCount > 0 ? <CheckIcon className="size-3.5" /> : null}
        </span>
        {selectedCount} of {pageCount} pages selected
      </p>
      <div className="flex items-center gap-1">
        <button type="button" disabled={disabled || allSelected} onClick={onSelectAll} className={SPLIT_UI.textButton}>
          <CheckIcon className="size-4" />
          Select all
        </button>
        <button type="button" disabled={disabled || selectedCount === 0} onClick={onClear} className={SPLIT_UI.textButton}>
          <XIcon className="size-4" />
          Clear selection
        </button>
      </div>
    </div>
  );
}
