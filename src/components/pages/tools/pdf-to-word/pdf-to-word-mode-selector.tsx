// src/components/pages/tools/pdf-to-word/pdf-to-word-mode-selector.tsx
"use client";

import { useId } from "react";
import { CheckCircleIcon } from "@/components/general/icons/pdf-icons";
import { cn } from "@/lib/utils";
import { CONVERSION_MODES } from "./pdf-to-word-constants";
import type { ConversionMode } from "./pdf-to-word-types";

interface Props {
  value: ConversionMode;
  onChange: (mode: ConversionMode) => void;
  disabled?: boolean;
}

export function PdfToWordModeSelector({ value, onChange, disabled }: Props) {
  const name = useId();

  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="sr-only">Conversion mode</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {CONVERSION_MODES.map((mode) => {
          const checked = value === mode.id;
          return (
            <label
              key={mode.id}
              className={cn(
                "relative flex cursor-pointer flex-col gap-1.5 rounded-xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-ring",
                checked
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="radio"
                name={name}
                value={mode.id}
                checked={checked}
                onChange={() => onChange(mode.id)}
                className="sr-only"
              />
              <span className="flex items-center gap-2 pr-7 font-semibold">
                <mode.Icon className="size-5 shrink-0 text-primary" />
                {mode.title}
              </span>
              <span className="text-sm text-muted-foreground">
                {mode.description}
              </span>
              {checked && (
                <CheckCircleIcon className="absolute right-3 top-3 size-5 text-primary" />
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}