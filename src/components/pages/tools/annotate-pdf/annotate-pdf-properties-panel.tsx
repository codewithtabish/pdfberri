"use client";
// src/components/pages/tools/annotate-pdf/annotate-pdf-properties-panel.tsx
import { PALETTE } from "./annotate-pdf-constants";
import type { Annotation, ToolId, ToolSettings } from "./annotate-pdf-types";
import { TrashIcon } from "@/components/general/icons/pdf-icons";

export function AnnotatePdfPropertiesPanel({
  tool,
  settings,
  onSettingsChange,
  selected,
  onDeleteSelected,
}: {
  tool: ToolId;
  settings: ToolSettings;
  onSettingsChange: (s: Partial<ToolSettings>) => void;
  selected: Annotation | null;
  onDeleteSelected: () => void;
}) {
  const showColor = ["highlight", "underline", "strikethrough", "pen", "rect", "circle", "arrow", "line"].includes(tool);
  const showFill = ["rect", "circle"].includes(tool);
  const showWidth = ["pen", "underline", "strikethrough", "rect", "circle", "arrow", "line"].includes(tool);
  const showOpacity = ["highlight", "underline", "strikethrough", "pen", "rect", "circle", "arrow", "line"].includes(tool);
  const showFont = tool === "text";

  return (
    <aside className="w-64 shrink-0 rounded-xl border border-border bg-card p-3">
      <h3 className="text-sm font-semibold">Annotation settings</h3>

      {!selected && (
        <p className="mt-3 text-xs text-muted-foreground">
          Select an annotation on the page or pick a tool to edit its properties.
        </p>
      )}

      {selected && (
        <div className="mt-3">
          <div className="rounded-md bg-muted px-2 py-1 text-xs capitalize">{selected.kind}</div>
          <button
            type="button"
            onClick={onDeleteSelected}
            className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-md border border-destructive/40 px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10"
          >
            <TrashIcon className="h-3.5 w-3.5" /> Delete annotation
          </button>
        </div>
      )}

      {showColor && (
        <div className="mt-4">
          <div className="text-xs font-medium text-muted-foreground">Color</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onSettingsChange({ color: c })}
                className={`h-6 w-6 rounded-full border ${
                  settings.color === c ? "ring-2 ring-primary ring-offset-1" : "border-border"
                }`}
                style={{ background: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>
      )}

      {showWidth && (
        <div className="mt-4">
          <label className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            Stroke width
            <span className="tabular-nums">{settings.strokeWidth}px</span>
          </label>
          <input
            type="range"
            min={1}
            max={12}
            step={1}
            value={settings.strokeWidth}
            onChange={(e) => onSettingsChange({ strokeWidth: Number(e.target.value) })}
            className="mt-1 w-full accent-(--color-primary)"
          />
        </div>
      )}

      {showOpacity && (
        <div className="mt-4">
          <label className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            Opacity
            <span className="tabular-nums">{Math.round(settings.opacity * 100)}%</span>
          </label>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={settings.opacity}
            onChange={(e) => onSettingsChange({ opacity: Number(e.target.value) })}
            className="mt-1 w-full accent-(--color-primary)"
          />
        </div>
      )}

      {showFill && (
        <div className="mt-4">
          <div className="text-xs font-medium text-muted-foreground">Fill</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onSettingsChange({ fill: null })}
              className={`h-6 w-6 rounded-full border bg-transparent text-[10px] ${
                settings.fill === null ? "ring-2 ring-primary ring-offset-1" : "border-border"
              }`}
            >
              ∅
            </button>
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onSettingsChange({ fill: c })}
                className={`h-6 w-6 rounded-full border ${
                  settings.fill === c ? "ring-2 ring-primary ring-offset-1" : "border-border"
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      )}

      {showFont && (
        <div className="mt-4">
          <label className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            Font size
            <span className="tabular-nums">{settings.fontSize}px</span>
          </label>
          <input
            type="range"
            min={10}
            max={36}
            step={1}
            value={settings.fontSize}
            onChange={(e) => onSettingsChange({ fontSize: Number(e.target.value) })}
            className="mt-1 w-full accent-(--color-primary)"
          />
        </div>
      )}
    </aside>
  );
}