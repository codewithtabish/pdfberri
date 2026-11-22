// src/components/pages/tools/word-to-pdf/word-to-pdf-consent.tsx
"use client";

import { useId } from "react";

import { ServerIcon } from "@/components/general/icons/pdf-icons";

interface WordConsentProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  reason: "legacy" | "fallback";
  maxFileLabel: string;
}

export function WordConsent({
  checked,
  onChange,
  reason,
  maxFileLabel,
}: WordConsentProps) {
  const id = useId();
  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        <ServerIcon className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="space-y-2">
          <h3 className="text-sm font-bold">
            {reason === "legacy"
              ? "This file needs server conversion"
              : "Convert on the server instead"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {reason === "legacy"
              ? "Older .doc files can’t be converted in your browser. "
              : "Your browser couldn’t convert this document. "}
            To continue, the document would be uploaded to PDFBerri, converted
            in a temporary private folder, and deleted from the server when the
            conversion finishes. Files up to {maxFileLabel} are supported.
          </p>
          <label
            htmlFor={id}
            className="flex cursor-pointer items-start gap-2 text-sm font-medium"
          >
            <input
              id={id}
              type="checkbox"
              checked={checked}
              onChange={(event) => onChange(event.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-primary"
            />
            <span>I agree to upload this document for conversion.</span>
          </label>
        </div>
      </div>
    </div>
  );
}
