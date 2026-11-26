"use client";

import { useId } from "react";
import { ChevronDownIcon, InfoIcon } from "@/components/general/icons/pdf-icons";
import { ORIENTATION_OPTIONS, PAGE_SIZE_OPTIONS } from "./powerpoint-to-pdf-constants";
import type { PptJobStatus, PptOrientation, PptPageSize, PptSettings } from "./powerpoint-to-pdf-types";

interface Props {
  settings: PptSettings;
  job: PptJobStatus;
  rangeError: string | null;
  disabled: boolean;
  onChange: (patch: Partial<PptSettings>) => void;
}

const selectClass =
  "h-11 w-full appearance-none rounded-lg border border-input bg-background px-3 pr-9 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

export function PowerPointToPdfSettings({ settings, job, rangeError, disabled, onChange }: Props) {
  const id = useId();
  const custom = settings.selection.mode === "custom";
  const hiddenCount = job.hiddenSlides?.length ?? 0;
  const hiddenUnknown = job.hiddenSlides === null;
  const showRangeError = custom && settings.selection.mode === "custom" && settings.selection.input.trim() !== "";

  return (
    <fieldset
      disabled={disabled}
      className="grid gap-5 rounded-xl border border-border bg-card p-4 sm:grid-cols-3 sm:p-5"
    >
      <legend className="sr-only">Conversion settings</legend>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold text-foreground">Slide selection</span>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name={`${id}-sel`}
            className="accent-primary"
            checked={!custom}
            onChange={() => onChange({ selection: { mode: "all" } })}
          />
          All slides ({job.slideCount})
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name={`${id}-sel`}
            className="accent-primary"
            checked={custom}
            onChange={() => onChange({ selection: { mode: "custom", input: "" } })}
          />
          Custom range
        </label>
        {custom && (
          <>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              placeholder="e.g. 1-5, 8, 10-12"
              aria-label="Slides to convert"
              aria-invalid={showRangeError && rangeError ? true : undefined}
              aria-describedby={`${id}-range-error`}
              value={settings.selection.mode === "custom" ? settings.selection.input : ""}
              onChange={(event) => onChange({ selection: { mode: "custom", input: event.target.value } })}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p id={`${id}-range-error`} className="min-h-4 text-xs text-destructive">
              {showRangeError ? rangeError : ""}
            </p>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-size`} className="text-sm font-bold text-foreground">
          Page size
        </label>
        <div className="relative">
          <select
            id={`${id}-size`}
            className={selectClass}
            value={settings.pageSize}
            onChange={(event) => onChange({ pageSize: event.target.value as PptPageSize })}
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground">Slides are scaled to fit, never stretched.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-orientation`} className="text-sm font-bold text-foreground">
          Orientation
        </label>
        <div className="relative">
          <select
            id={`${id}-orientation`}
            className={selectClass}
            value={settings.orientation}
            disabled={settings.pageSize === "original"}
            onChange={(event) => onChange({ orientation: event.target.value as PptOrientation })}
          >
            {ORIENTATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        {settings.pageSize === "original" && (
          <p className="text-xs text-muted-foreground">Applies when A4 or US Letter is selected.</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5 sm:col-span-3">
        {hiddenCount > 0 && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-primary"
              checked={settings.includeHidden}
              onChange={(event) => onChange({ includeHidden: event.target.checked })}
            />
            Include {hiddenCount} hidden slide{hiddenCount === 1 ? "" : "s"}
          </label>
        )}
        {hiddenUnknown && (
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
            Hidden slides can&apos;t be detected in legacy .ppt files, so every slide is exported.
          </p>
        )}
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
          The PDF contains the slides only. Speaker notes and animations are not included.
        </p>
      </div>
    </fieldset>
  );
}
