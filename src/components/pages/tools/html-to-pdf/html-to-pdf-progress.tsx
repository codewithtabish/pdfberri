"use client";

import type { ConversionStage } from "./html-to-pdf-types";

interface Props {
  stage: ConversionStage;
  message: string;
  progress: number | null;
  onCancel?: () => void;
}

export function HtmlToPdfProgress({ stage, message, progress, onCancel }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-12 text-center">
      <div className="relative mb-6 size-14">
        <div className="absolute inset-0 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>

      <p className="text-lg font-medium">{message || "Processing..."}</p>
      <p className="mt-1 text-sm text-muted-foreground capitalize">
        {stage.replace(/-/g, " ")}
      </p>

      {progress !== null && (
        <div className="mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="mt-6 text-sm text-muted-foreground underline-offset-2 hover:underline"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
