"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PdfSettings } from "./html-to-pdf-types";

interface Props {
  settings: PdfSettings;
  onChange: (partial: Partial<PdfSettings>) => void;
  disabled?: boolean;
}

export function HtmlToPdfAdvancedSettings({ settings, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-primary hover:bg-muted/40"
        disabled={disabled}
      >
        Advanced Options
        <svg
          className={cn("size-4 transition-transform", open && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="space-y-3 border-t border-border px-4 py-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.includeBackgroundGraphics}
              onChange={(e) => onChange({ includeBackgroundGraphics: e.target.checked })}
              disabled={disabled}
              className="size-4 rounded border-border text-primary focus:ring-primary"
            />
            Include background graphics
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.printBackground}
              onChange={(e) => onChange({ printBackground: e.target.checked })}
              disabled={disabled}
              className="size-4 rounded border-border text-primary focus:ring-primary"
            />
            Print page backgrounds
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.pageNumbers}
              onChange={(e) => onChange({ pageNumbers: e.target.checked })}
              disabled={disabled}
              className="size-4 rounded border-border text-primary focus:ring-primary"
            />
            Page numbers
          </label>
        </div>
      )}
    </div>
  );
}
