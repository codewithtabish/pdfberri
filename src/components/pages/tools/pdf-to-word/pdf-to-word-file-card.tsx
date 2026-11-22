// src/components/pages/tools/pdf-to-word/pdf-to-word-file-card.tsx
"use client";

import {
  AlertCircleIcon,
  CheckCircleIcon,
  LoaderIcon,
  PdfFileIcon,
  TrashIcon,
} from "@/components/general/icons/pdf-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PdfInspection } from "./pdf-to-word-types";
import { formatBytes, pluralize } from "./pdf-to-word-utils";

export type FileCardStatus =
  | "checking"
  | "password"
  | "ready"
  | "converting"
  | "done"
  | "error";

const STATUS_LABEL: Record<FileCardStatus, string> = {
  checking: "Checking…",
  password: "Password needed",
  ready: "Ready",
  converting: "Converting…",
  done: "Converted",
  error: "Needs attention",
};

interface Props {
  file: File;
  inspection: PdfInspection | null;
  status: FileCardStatus;
  onRemove: () => void;
  removeDisabled?: boolean;
}

export function PdfToWordFileCard({
  file,
  inspection,
  status,
  onRemove,
  removeDisabled = false,
}: Props) {
  const StatusIcon =
    status === "checking" || status === "converting"
      ? LoaderIcon
      : status === "error" || status === "password"
        ? AlertCircleIcon
        : CheckCircleIcon;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3 sm:flex-nowrap">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <PdfFileIcon className="size-6" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold" title={file.name}>
          {file.name}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatBytes(file.size)}
          {inspection && (
            <>
              {" · "}
              {inspection.pageCount} {pluralize(inspection.pageCount, "page")}
              {" · "}
              {inspection.likelyScanned
                ? "Scanned pages detected"
                : inspection.hasExtractableText
                  ? "Selectable text"
                  : "No selectable text"}
            </>
          )}
        </p>
      </div>

      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium",
          status === "error" || status === "password"
            ? "border-destructive/30 text-destructive"
            : "border-primary/30 text-primary",
        )}
      >
        <StatusIcon
          className={cn(
            "size-4",
            (status === "checking" || status === "converting") &&
              "animate-spin motion-reduce:animate-none",
          )}
        />
        {STATUS_LABEL[status]}
      </span>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onRemove}
        disabled={removeDisabled}
        className="border-destructive/30 text-destructive hover:text-destructive"
        aria-label={`Remove ${file.name}`}
      >
        <TrashIcon className="size-4" />
        Remove
      </Button>
    </div>
  );
}