// src/components/pages/tools/pdf-to-word/pdf-to-word-ocr-settings.tsx
"use client";

import { useId } from "react";
import { InfoIcon } from "@/components/general/icons/pdf-icons";
import { cn } from "@/lib/utils";
import {
  OCR_LANGUAGES,
  PDF_TO_WORD_LIMITS,
} from "./pdf-to-word-constants";

interface Props {
  enabled: boolean;
  language: string;
  recommended: boolean;
  disabled?: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onLanguageChange: (language: string) => void;
}

export function PdfToWordOcrSettings({
  enabled,
  language,
  recommended,
  disabled,
  onEnabledChange,
  onLanguageChange,
}: Props) {
  const id = useId();

  return (
    <div className="space-y-3 rounded-xl border border-border p-4">
      <div className="flex items-start gap-3">
        <span className="rounded-md bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground">
          OCR
        </span>
        <div className="min-w-0 flex-1">
          <p id={`${id}-label`} className="text-sm font-semibold">
            Recognize text in scanned PDFs
          </p>
          <p id={`${id}-desc`} className="text-sm text-muted-foreground">
            Detect text inside scanned pages and make it editable using OCR.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-labelledby={`${id}-label`}
          aria-describedby={`${id}-desc`}
          disabled={disabled}
          onClick={() => onEnabledChange(!enabled)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
            enabled ? "bg-primary" : "bg-input",
          )}
        >
          <span
            className={cn(
              "pointer-events-none block size-5 rounded-full bg-background shadow transition-transform motion-reduce:transition-none",
              enabled ? "translate-x-[22px]" : "translate-x-0.5",
            )}
          />
        </button>
      </div>

      {recommended && !enabled && (
        <p
          role="note"
          className="flex items-start gap-2 text-sm text-muted-foreground"
        >
          <InfoIcon className="mt-0.5 size-4 shrink-0 text-primary" />
          This PDF looks scanned. Turn on OCR to get editable text.
        </p>
      )}

      {enabled && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor={`${id}-lang`} className="text-sm font-medium">
              Document language
            </label>
            <select
              id={`${id}-lang`}
              value={language}
              disabled={disabled}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              {OCR_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-muted-foreground">
            Recognition runs in your browser for up to{" "}
            {PDF_TO_WORD_LIMITS.maxOcrPages} pages. Language data is downloaded
            once from a public CDN; your document is not uploaded.
          </p>
        </div>
      )}
    </div>
  );
}