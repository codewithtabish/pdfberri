"use client";

import type { ConversionError } from "./html-to-pdf-types";

interface Props {
  error: ConversionError;
  onRetry?: () => void;
  onReset?: () => void;
}

export function HtmlToPdfError({ error, onRetry, onReset }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>

      <h2 className="text-lg font-semibold">{error.title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{error.message}</p>
      {error.actionable && (
        <p className="mt-1 text-sm text-muted-foreground">{error.actionable}</p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {error.retryable && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
        )}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-border px-5 py-2 text-sm font-medium hover:bg-muted/50"
          >
            Start over
          </button>
        )}
      </div>
    </div>
  );
}
