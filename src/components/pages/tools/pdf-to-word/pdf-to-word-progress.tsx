// src/components/pages/tools/pdf-to-word/pdf-to-word-progress.tsx
"use client";

import {
  CheckCircleIcon,
  CircleIcon,
  LoaderIcon,
} from "@/components/general/icons/pdf-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PROCESS_STAGES } from "./pdf-to-word-constants";
import type { ConversionProgress } from "./pdf-to-word-types";

interface Props {
  progress: ConversionProgress | null;
  ocrEnabled: boolean;
  onCancel: () => void;
}

export function PdfToWordProgress({ progress, ocrEnabled, onCancel }: Props) {
  const stages = PROCESS_STAGES.filter((s) => ocrEnabled || s.id !== "ocr");
  const activeId = progress?.stage ?? "reading";
  const activeIndex = Math.max(
    0,
    stages.findIndex((s) => s.id === activeId),
  );

  const measurable =
    progress !== null &&
    (progress.stage === "extracting" || progress.stage === "ocr") &&
    progress.total > 0;
  const detail = measurable
    ? `Page ${progress.current} of ${progress.total}`
    : null;
  const ratio =
    (activeIndex + (measurable ? progress.current / progress.total : 0)) /
    stages.length;

  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-4">
        <LoaderIcon className="size-10 shrink-0 animate-spin text-primary motion-reduce:animate-none" />
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold">Processing your PDF</h3>
          <p className="text-sm text-muted-foreground">
            {stages[activeIndex]?.label}
            {detail ? ` · ${detail}` : ""}
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <div
        role="progressbar"
        aria-label="Conversion progress"
        aria-valuemin={0}
        aria-valuemax={stages.length}
        aria-valuenow={activeIndex}
        aria-valuetext={stages[activeIndex]?.label}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </div>

      <ol className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(120px,1fr))]">
        {stages.map((stage, index) => {
          const done = index < activeIndex;
          const active = index === activeIndex;
          return (
            <li
              key={stage.id}
              aria-current={active ? "step" : undefined}
              className="flex items-start gap-2 text-sm"
            >
              {done ? (
                <CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-primary" />
              ) : active ? (
                <LoaderIcon className="mt-0.5 size-5 shrink-0 animate-spin text-primary motion-reduce:animate-none" />
              ) : (
                <CircleIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              )}
              <span
                className={cn(
                  active ? "font-semibold" : "text-muted-foreground",
                )}
              >
                {stage.label}
                <span className="sr-only">
                  {done ? " (completed)" : active ? " (in progress)" : " (pending)"}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}