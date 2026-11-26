"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  LoaderIcon,
  PowerpointIcon,
  RefreshIcon,
  TrashIcon,
} from "@/components/general/icons/pdf-icons";
import { ACCEPT_ATTRIBUTE } from "./powerpoint-to-pdf-constants";
import type { Phase } from "./use-powerpoint-to-pdf";
import type { PptJobStatus } from "./powerpoint-to-pdf-types";
import { formatBytes } from "./powerpoint-to-pdf-utils";

interface Props {
  file: File;
  job: PptJobStatus | null;
  phase: Phase;
  onReplace: (file: File) => void;
  onRemove: () => void;
}

export function PowerPointToPdfFileCard({ file, job, phase, onReplace, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = phase === "uploading" || phase === "processing";
  const format = file.name.toLowerCase().endsWith(".ppt") ? "PPT" : "PPTX";

  const slideText =
    job?.slideCount != null
      ? `${job.slideCount} slide${job.slideCount === 1 ? "" : "s"}${
          job.hiddenSlides?.length ? ` (${job.hiddenSlides.length} hidden)` : ""
        }`
      : busy
        ? "Inspecting presentation…"
        : null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3 sm:p-4">
      <PowerpointIcon className="size-10 shrink-0 text-orange-600" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatBytes(file.size)} · {format}
          {slideText ? ` · ${slideText}` : ""}
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-sm font-medium" role="status">
        {busy && (
          <>
            <LoaderIcon className="size-4 animate-spin text-primary motion-reduce:animate-none" />
            <span className="text-muted-foreground">Working…</span>
          </>
        )}
        {(phase === "ready" || phase === "finalizing" || phase === "completed") && (
          <>
            <CheckCircleIcon className="size-4 text-emerald-600" />
            <span className="text-emerald-700 dark:text-emerald-400">File ready</span>
          </>
        )}
        {phase === "failed" && (
          <>
            <AlertCircleIcon className="size-4 text-destructive" />
            <span className="text-destructive">Can&apos;t convert</span>
          </>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <RefreshIcon className="size-4" />
          Replace
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-destructive/40 text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <TrashIcon className="size-4" />
          {busy ? "Cancel" : "Remove"}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const next = event.target.files?.[0];
          event.target.value = "";
          if (next) onReplace(next);
        }}
      />
    </div>
  );
}
