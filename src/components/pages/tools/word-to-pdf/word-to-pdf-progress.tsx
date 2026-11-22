// src/components/pages/tools/word-to-pdf/word-to-pdf-progress.tsx

import { LoaderIcon } from "@/components/general/icons/pdf-icons";

import { WordButton } from "./word-to-pdf-button";
import type { ConversionProgress } from "./word-to-pdf-types";

interface WordProgressProps {
  progress: ConversionProgress | null;
  onCancel: () => void;
  processesLocally: boolean;
}

export function WordProgress({
  progress,
  onCancel,
  processesLocally,
}: WordProgressProps) {
  const determinate =
    progress?.total !== undefined &&
    progress.total > 0 &&
    progress.completed !== undefined;
  const percent = determinate
    ? Math.min(100, Math.round(((progress.completed ?? 0) / (progress.total ?? 1)) * 100))
    : undefined;

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-background/60 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <LoaderIcon className="size-5 animate-spin text-primary motion-reduce:animate-none" />
          <div>
            <p className="text-sm font-bold">{progress?.message ?? "Converting…"}</p>
            <p className="text-xs text-muted-foreground">
              {processesLocally
                ? "Working in your browser. Keep this tab open."
                : "Working on the server. Keep this tab open."}
            </p>
          </div>
        </div>
        {percent !== undefined ? (
          <span className="font-mono text-sm font-semibold">{percent}%</span>
        ) : null}
      </div>

      <div
        role="progressbar"
        aria-label="Conversion progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-busy={percent === undefined}
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className={
            percent === undefined
              ? "h-full w-full animate-pulse rounded-full bg-primary/60 motion-reduce:animate-none"
              : "h-full rounded-full bg-primary transition-[width] motion-reduce:transition-none"
          }
          style={percent === undefined ? undefined : { width: `${percent}%` }}
        />
      </div>

      <WordButton onClick={onCancel}>Cancel</WordButton>
    </div>
  );
}
