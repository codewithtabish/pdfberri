import { AlertCircle, RotateCcw, X } from "lucide-react";
import { MergeIssue } from "./merge-types";

interface MergeErrorProps {
  message: string;
  onRetry: () => void;
  onBack: () => void;
}

/** Shown when the merge itself fails. The user's files are kept. */
export function MergeError({ message, onRetry, onBack }: MergeErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-10 text-center"
    >
      <span
        aria-hidden="true"
        className="inline-flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive"
      >
        <AlertCircle className="size-6" />
      </span>
      <h2 className="mt-4 text-lg font-bold tracking-tight text-foreground">
        We couldn&apos;t merge your PDFs
      </h2>
      <p className="mt-2 max-w-md text-sm text-foreground/75">{message}</p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          Try again
        </button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to my files
        </button>
      </div>
    </div>
  );
}

interface MergeIssuesProps {
  issues: MergeIssue[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
}

/** Lists files that were rejected, so nothing is ever ignored silently. */
export function MergeIssues({ issues, onDismiss, onDismissAll }: MergeIssuesProps) {
  if (issues.length === 0) return null;

  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 sm:p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <AlertCircle aria-hidden="true" className="size-4 text-destructive" />
          {issues.length === 1
            ? "1 file couldn't be added"
            : `${issues.length} files couldn't be added`}
        </p>
        <button
          type="button"
          onClick={onDismissAll}
          className="rounded-md px-2 py-1 text-xs font-semibold text-foreground/75 hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Dismiss all
        </button>
      </div>

      <ul className="mt-2 flex flex-col gap-1.5">
        {issues.map((issue) => (
          <li
            key={issue.id}
            className="flex items-start justify-between gap-3 text-sm"
          >
            <span className="min-w-0 text-foreground/80">
              <span className="font-semibold break-all text-foreground">
                {issue.fileName}
              </span>
              {": "}
              {issue.message}
            </span>
            <button
              type="button"
              onClick={() => onDismiss(issue.id)}
              aria-label={`Dismiss message about ${issue.fileName}`}
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-foreground/65 hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}