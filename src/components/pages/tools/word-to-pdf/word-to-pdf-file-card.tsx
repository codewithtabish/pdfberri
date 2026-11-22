// src/components/pages/tools/word-to-pdf/word-to-pdf-file-card.tsx

import {
  ArrowRightIcon,
  CheckCircleIcon,
  PdfFileIcon,
  RefreshIcon,
  TrashIcon,
  WordIcon,
} from "@/components/general/icons/pdf-icons";

import { WordButton } from "./word-to-pdf-button";
import type { ValidatedWordFile } from "./word-to-pdf-types";
import { formatBytes } from "./word-to-pdf-utils";

interface WordFileCardProps {
  file: ValidatedWordFile;
  statusLabel: string;
  onReplace?: () => void;
  onRemove?: () => void;
}

export function WordFileCard({
  file,
  statusLabel,
  onReplace,
  onRemove,
}: WordFileCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <WordIcon className="size-8" />
        </span>
        <div className="min-w-0 space-y-1.5">
          <p className="truncate text-base font-bold" title={file.safeName}>
            {file.safeName}
          </p>
          <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono font-semibold uppercase text-primary">
              {file.format}
            </span>
            <span className="font-mono">{formatBytes(file.sizeBytes)}</span>
          </p>
          <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircleIcon className="size-4" />
            {statusLabel}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span
          className="hidden items-center gap-2 text-muted-foreground lg:flex"
          aria-hidden="true"
        >
          <WordIcon className="size-9 text-primary" />
          <ArrowRightIcon className="size-5" />
          <PdfFileIcon className="size-9 text-destructive" />
        </span>
        {onReplace ? (
          <WordButton onClick={onReplace}>
            <RefreshIcon className="size-4" />
            Replace
          </WordButton>
        ) : null}
        {onRemove ? (
          <WordButton variant="danger" onClick={onRemove}>
            <TrashIcon className="size-4" />
            Remove
          </WordButton>
        ) : null}
      </div>
    </div>
  );
}
