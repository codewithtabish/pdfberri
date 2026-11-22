"use client";

import type { ConversionSettings } from "./pdf-to-jpg-types";

interface SettingsProps {
  settings: ConversionSettings;
  onChange: (s: ConversionSettings) => void;
  disabled: boolean;
  selectedCount: number;
}

export function PdfToJpgSettings({ settings, onChange, disabled, selectedCount }: SettingsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">Image Quality</label>
        <div className="flex gap-2">
          {(["standard", "high", "maximum"] as const).map((q) => (
            <button
              key={q}
              onClick={() => onChange({ ...settings, quality: q })}
              disabled={disabled}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition-colors ${
                settings.quality === q ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">Resolution</label>
        <div className="grid grid-cols-2 gap-2">
          {([72, 150, 200, 300] as const).map((dpi) => (
            <button
              key={dpi}
              onClick={() => onChange({ ...settings, resolution: dpi })}
              disabled={disabled}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                settings.resolution === dpi ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {dpi} DPI
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">Pages to Convert</label>
        <div className="flex gap-2">
          <button
            onClick={() => onChange({ ...settings, pageSelection: "all" })}
            disabled={disabled}
            className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold ${
              settings.pageSelection === "all" ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
            }`}
          >
            All Pages
          </button>
          <button
            onClick={() => onChange({ ...settings, pageSelection: "selected" })}
            disabled={disabled}
            className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold ${
              settings.pageSelection === "selected" ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
            }`}
          >
            Selected ({selectedCount})
          </button>
        </div>
      </div>
    </div>
  );
}