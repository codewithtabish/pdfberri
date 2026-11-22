// src/components/pages/tools/word-to-pdf/word-to-pdf-error.tsx

import type { ReactNode } from "react";

import { AlertCircleIcon, XIcon } from "@/components/general/icons/pdf-icons";

import { describeError, type WordToPdfError } from "./word-to-pdf-errors";

interface WordErrorNoticeProps {
  error: WordToPdfError;
  onDismiss?: () => void;
  children?: ReactNode;
}

export function WordErrorNotice({ error, onDismiss, children }: WordErrorNoticeProps) {
  const copy = describeError(error.code, error.detail);
  return (
    <div
      role="alert"
      className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4"
    >
      <div className="flex items-start gap-3">
        <AlertCircleIcon className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-bold text-destructive">{copy.title}</p>
          <p className="text-sm text-foreground">{copy.description}</p>
          <p className="text-sm text-muted-foreground">{copy.action}</p>
        </div>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss message"
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            <XIcon className="size-4" />
          </button>
        ) : null}
      </div>
      {children ? <div className="mt-4 space-y-4">{children}</div> : null}
    </div>
  );
}
