"use client";

import { cn } from "@/lib/utils";
import type { MarginPreset, Orientation, PageSize, PdfSettings } from "./html-to-pdf-types";

interface Props {
  settings: PdfSettings;
  onChange: (partial: Partial<PdfSettings>) => void;
  disabled?: boolean;
}

const PAGE_SIZES: PageSize[] = ["A4", "Letter", "Legal", "A3"];
const ORIENTATIONS: { id: Orientation; label: string }[] = [
  { id: "portrait", label: "Portrait" },
  { id: "landscape", label: "Landscape" },
  { id: "auto", label: "Auto" },
];
const MARGINS: { id: MarginPreset; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "narrow", label: "Narrow" },
  { id: "wide", label: "Wide" },
];

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  disabled,
}: {
  options: { id: T; label: string }[] | T[];
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  const items = options.map((o) => (typeof o === "string" ? { id: o, label: o } : o));
  return (
    <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(item.id)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            value === item.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function HtmlToPdfSettings({ settings, onChange, disabled }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
        <svg className="size-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        PDF Settings
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Page Size</p>
          <SegmentedControl
            options={PAGE_SIZES}
            value={settings.pageSize}
            onChange={(v) => onChange({ pageSize: v })}
            disabled={disabled}
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Orientation</p>
          <SegmentedControl
            options={ORIENTATIONS}
            value={settings.orientation}
            onChange={(v) => onChange({ orientation: v })}
            disabled={disabled}
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Margins</p>
          <SegmentedControl
            options={MARGINS}
            value={settings.margins}
            onChange={(v) => onChange({ margins: v })}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
