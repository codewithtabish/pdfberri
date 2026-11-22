"use client";

import { useId } from "react";
import {
  BoltIcon,
  ChevronDownIcon,
  LoaderIcon,
  SettingsIcon,
} from "@/components/general/icons/pdf-icons";
import {
  FIT_MODE_HINTS,
  FIT_MODE_OPTIONS,
  MARGIN_OPTIONS,
  ORIENTATION_OPTIONS,
  PAGE_SIZE_OPTIONS,
  QUALITY_HINTS,
  QUALITY_OPTIONS,
  type OptionDef,
} from "./jpg-to-pdf-config";
import type { PdfSettings } from "./jpg-to-pdf-types";
import { plural } from "./jpg-to-pdf-utils";

interface OptionGroupProps<T extends string> {
  legend: string;
  name: string;
  options: readonly OptionDef<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  hint?: string;
}

function OptionGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  disabled = false,
  hint,
}: OptionGroupProps<T>) {
  const groupId = useId();
  return (
    <fieldset className="min-w-0" disabled={disabled}>
      <legend className="mb-2 text-sm font-bold text-foreground">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input
              type="radio"
              name={`${groupId}-${name}`}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span className="inline-flex items-center rounded-full border border-border bg-card px-4 py-1.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 motion-reduce:transition-none">
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {hint ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
    </fieldset>
  );
}

interface JpgToPdfSettingsProps {
  settings: PdfSettings;
  imageCount: number;
  disabled: boolean;
  isConverting: boolean;
  onChange: (patch: Partial<PdfSettings>) => void;
  onConvert: () => void;
}

export function JpgToPdfSettings({
  settings,
  imageCount,
  disabled,
  isConverting,
  onChange,
  onConvert,
}: JpgToPdfSettingsProps) {
  const isFit = settings.pageSize === "fit";
  const fitLabel = FIT_MODE_OPTIONS.find((option) => option.value === settings.fitMode)?.label;
  const qualityLabel = QUALITY_OPTIONS.find((option) => option.value === settings.quality)?.label;

  return (
    <section
      aria-labelledby="jpg-to-pdf-settings-heading"
      className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <h2 id="jpg-to-pdf-settings-heading" className="flex items-center gap-2 text-lg font-bold text-foreground">
        <SettingsIcon className="size-5 text-primary" />
        PDF settings
      </h2>

      <OptionGroup
        legend="Page size"
        name="page-size"
        options={PAGE_SIZE_OPTIONS}
        value={settings.pageSize}
        onChange={(pageSize) => onChange({ pageSize })}
        disabled={disabled}
      />
      <OptionGroup
        legend="Orientation"
        name="orientation"
        options={ORIENTATION_OPTIONS}
        value={settings.orientation}
        onChange={(orientation) => onChange({ orientation })}
        disabled={disabled || isFit}
        hint={isFit ? "Fit to image uses each image's own shape." : "Auto picks portrait or landscape per image."}
      />
      <OptionGroup
        legend="Margin"
        name="margin"
        options={MARGIN_OPTIONS}
        value={settings.margin}
        onChange={(margin) => onChange({ margin })}
        disabled={disabled}
      />

      <details className="group rounded-xl border border-border">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
          <span className="min-w-0">
            <span className="block text-sm font-bold text-foreground">Advanced options</span>
            <span className="block truncate text-xs text-muted-foreground">
              {fitLabel} fit · {qualityLabel} quality
            </span>
          </span>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" />
        </summary>
        <div className="flex flex-col gap-5 px-4 pb-4 pt-1">
          <OptionGroup
            legend="Image fit"
            name="fit-mode"
            options={FIT_MODE_OPTIONS}
            value={settings.fitMode}
            onChange={(fitMode) => onChange({ fitMode })}
            disabled={disabled}
            hint={FIT_MODE_HINTS[settings.fitMode]}
          />
          <OptionGroup
            legend="Image quality"
            name="quality"
            options={QUALITY_OPTIONS}
            value={settings.quality}
            onChange={(quality) => onChange({ quality })}
            disabled={disabled}
            hint={QUALITY_HINTS[settings.quality]}
          />
        </div>
      </details>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onConvert}
          disabled={disabled || imageCount === 0}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
        >
          {isConverting ? (
            <LoaderIcon className="size-5 animate-spin motion-reduce:animate-none" />
          ) : (
            <BoltIcon className="size-5" />
          )}
          {isConverting ? "Converting…" : "Convert to PDF"}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          {imageCount === 0
            ? "Add images to get started."
            : `${imageCount} ${plural(imageCount, "image")} will become 1 PDF with ${imageCount} ${plural(imageCount, "page")}.`}
        </p>
      </div>
    </section>
  );
}