"use client";

import { useState } from "react";
import type { CompressionSettings } from "./compress-types";
import { ChevronDownIcon, LayersIcon } from "@/components/general/icons/pdf-icons";

interface CompressAdvancedSettingsProps {
  value: CompressionSettings;
  onChange: (settings: CompressionSettings) => void;
  disabled?: boolean;
}

const LABELS: Record<keyof CompressionSettings, { label: string; hint: string }> = {
  useObjectStreams: { label: "Use object streams", hint: "Repackage the PDF with stream compression. Usually safe." },
  stripMetadata: { label: "Strip metadata", hint: "Removes title, author, subject, keywords, creator, producer." },
  stripXmp: { label: "Strip XMP", hint: "Removes XMP metadata (kept by pdf-lib unless rewritten)." },
  updateModificationDate: { label: "Update modification date", hint: "Sets the modification date to now." },
  pruneOrphans: { label: "Prune orphan objects", hint: "Removes unreferenced objects where pdf-lib allows." },
};

export function CompressAdvancedSettings({ value, onChange, disabled }: CompressAdvancedSettingsProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3 text-left text-sm font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex items-center gap-2">
          <LayersIcon className="size-5 text-primary" />
          Advanced Settings (Optional)
        </span>
        <ChevronDownIcon className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <fieldset disabled={disabled} className="space-y-3 border-t border-border px-4 py-3">
          {(Object.keys(LABELS) as Array<keyof CompressionSettings>).map((key) => (
            <label key={key} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={value[key]}
                onChange={(event) => onChange({ ...value, [key]: event.target.checked })}
                className="mt-1 size-4 accent-primary"
              />
              <span>
                <span className="block text-sm font-semibold text-foreground">{LABELS[key].label}</span>
                <span className="block text-xs text-muted-foreground">{LABELS[key].hint}</span>
              </span>
            </label>
          ))}
        </fieldset>
      ) : null}
    </div>
  );
}