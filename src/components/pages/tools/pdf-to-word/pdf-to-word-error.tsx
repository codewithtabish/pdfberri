// src/components/pages/tools/pdf-to-word/pdf-to-word-error.tsx
"use client";

import { AlertCircleIcon, RefreshIcon } from "@/components/general/icons/pdf-icons";
import { Button } from "@/components/ui/button";
import type { ConversionErrorInfo } from "./pdf-to-word-types";

interface Props {
  error: ConversionErrorInfo;
  onRetry?: () => void;
  onReset: () => void;
}

export function PdfToWordError({ error, onRetry, onReset }: Props) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-5 sm:flex-row sm:items-center"
    >
      <AlertCircleIcon className="size-8 shrink-0 text-destructive" />
      <div className="min-w-0 flex-1">
        <h3 className="font-bold">Conversion couldn’t be completed</h3>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
      <div className="flex gap-2">
        {onRetry && (
          <Button type="button" onClick={onRetry}>
            <RefreshIcon className="size-4" />
            Try again
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onReset}>
          Choose another PDF
        </Button>
      </div>
    </div>
  );
}