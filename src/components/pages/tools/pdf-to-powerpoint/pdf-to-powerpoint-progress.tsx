"use client";

import { Button } from "@/components/ui/button";
import { LoaderIcon } from "@/components/general/icons/pdf-icons";
import type { ProgressState } from "./pdf-to-powerpoint-types";

interface Props {
  progress: ProgressState | null;
  onCancel: () => void;
}

export function PdfToPowerpointProgress({ progress, onCancel }: Props) {
  const percent = progress?.percent ?? 0;
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex w-full max-w-xl flex-col gap-3 rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-bold text-foreground">
          <LoaderIcon className="size-4 animate-spin text-primary motion-reduce:animate-none" />
          {progress?.message ?? "Starting…"}
        </span>
        <span className="text-xs font-semibold text-muted-foreground">{percent}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full bg-primary transition-[width]" style={{ width: `${percent}%` }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {progress && progress.stage === "rendering"
            ? `Page ${Math.min(progress.current + 1, progress.total)} of ${progress.total}`
            : " "}
        </span>
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
