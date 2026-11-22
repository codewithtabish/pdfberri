// src/components/pages/tools/word-to-pdf/word-to-pdf-settings.tsx
"use client";

import { useId } from "react";

import { InfoIcon, SlidersIcon } from "@/components/general/icons/pdf-icons";

import {
  PAGE_SIZE_OPTIONS,
  QUALITY_OPTIONS,
  QUALITY_PRESETS,
} from "./word-to-pdf-constants";
import type { SettingKey, WordToPdfSettings } from "./word-to-pdf-types";
import { joinClasses } from "./word-to-pdf-utils";

interface WordConversionSettingsProps {
  settings: WordToPdfSettings;
  supported: readonly SettingKey[];
  onChange: (patch: Partial<WordToPdfSettings>) => void;
  disabled?: boolean;
}

interface OptionGroupProps<T extends string> {
  legend: string;
  name: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
  disabled?: boolean;
}

function OptionGroup<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
  disabled,
}: OptionGroupProps<T>) {
  return (
    <fieldset className="min-w-0 space-y-2" disabled={disabled}>
      <legend className="text-sm font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label key={option.value} className="cursor-pointer">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <span
                className={joinClasses(
                  "inline-flex h-9 min-w-20 items-center justify-center rounded-full border px-4 text-sm font-semibold transition-colors motion-reduce:transition-none",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
                  checked
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-muted",
                )}
              >
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function WordConversionSettings({
  settings,
  supported,
  onChange,
  disabled,
}: WordConversionSettingsProps) {
  const groupId = useId();
  const showPageSize = supported.includes("pageSize");
  const showQuality = supported.includes("quality");

  if (!showPageSize && !showQuality) {
    return (
      <p className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <InfoIcon className="mt-0.5 size-4 shrink-0 text-primary" />
        Server conversion keeps the original page layout of your document. There
        are no extra options to set.
      </p>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-background/60 p-4">
      <h3 className="flex items-center gap-2 text-sm font-bold">
        <SlidersIcon className="size-4 text-primary" />
        Conversion options
      </h3>
      <div className="grid gap-5 sm:grid-cols-2">
        {showPageSize ? (
          <div className="space-y-2">
            <OptionGroup
              legend="Page size"
              name={`${groupId}-page-size`}
              value={settings.pageSize}
              options={PAGE_SIZE_OPTIONS}
              onChange={(pageSize) => onChange({ pageSize })}
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">
              {settings.pageSize === "original"
                ? "Keeps each page exactly as your document lays it out."
                : "Pages are scaled to fit and centred on the chosen paper size."}
            </p>
          </div>
        ) : null}
        {showQuality ? (
          <div className="space-y-2">
            <OptionGroup
              legend="Image quality"
              name={`${groupId}-quality`}
              value={settings.quality}
              options={QUALITY_OPTIONS}
              onChange={(quality) => onChange({ quality })}
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">
              {QUALITY_PRESETS[settings.quality].hint}.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
