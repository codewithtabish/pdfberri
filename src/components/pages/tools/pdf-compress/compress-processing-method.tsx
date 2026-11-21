"use client";

import { cn } from "@/lib/utils";
import { LockIcon, SparklesIcon } from "@/components/general/icons/pdf-icons";
import type { ProcessingMethod } from "./compress-types";

interface CompressProcessingMethodProps {
  value: ProcessingMethod;
  onChange: (method: ProcessingMethod) => void;
  disabled?: boolean;
}

/** Cloud is intentionally disabled until a real cloud engine exists in the repo. */
export function CompressProcessingMethod({ value, onChange, disabled }: CompressProcessingMethodProps) {
  return (
    <fieldset disabled={disabled}>
      <legend className="mb-3 text-base font-bold text-foreground">Processing method</legend>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="relative block cursor-pointer">
          <input type="radio" name="processing-method" checked={value === "local"} onChange={() => onChange("local")} className="peer sr-only" />
          <span
            className={cn(
              "flex h-full items-start gap-3 rounded-xl border p-4 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
              value === "local" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-primary/40",
            )}
          >
            <LockIcon className="mt-0.5 size-5 shrink-0 text-primary" />
            <span>
              <span className="block text-sm font-bold text-foreground">Process in your browser</span>
              <span className="block text-xs text-muted-foreground">Your PDF never leaves your device.</span>
            </span>
          </span>
        </label>
        <label className="relative block cursor-not-allowed opacity-60" title="Cloud processing is not available in this build.">
          <input type="radio" name="processing-method" disabled checked={false} className="peer sr-only" />
          <span className="flex h-full items-start gap-3 rounded-xl border border-border bg-card p-4">
            <SparklesIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <span>
              <span className="block text-sm font-bold text-foreground">Secure cloud processing</span>
              <span className="block text-xs text-muted-foreground">Not available yet.</span>
            </span>
          </span>
        </label>
      </div>
    </fieldset>
  );
}