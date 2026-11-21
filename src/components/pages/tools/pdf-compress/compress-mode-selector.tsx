"use client";

import { cn } from "@/lib/utils";
import { describeMode } from "./compress-planner";
import type { CompressionMode } from "./compress-types";
import { BoltIcon, LayersIcon, SparklesIcon, TargetIcon } from "@/components/general/icons/pdf-icons";

interface ModeOption {
  id: CompressionMode;
  title: string;
  description: string;
  recommended?: boolean;
  Icon: typeof BoltIcon;
}

const OPTIONS: ModeOption[] = [
  { id: "recommended", title: "Recommended", description: describeMode("recommended"), recommended: true, Icon: SparklesIcon },
  { id: "high", title: "High compression", description: describeMode("high"), Icon: BoltIcon },
  { id: "maximum-quality", title: "Maximum quality", description: describeMode("maximum-quality"), Icon: TargetIcon },
  { id: "custom", title: "Custom", description: describeMode("custom"), Icon: LayersIcon },
];

interface CompressModeSelectorProps {
  value: CompressionMode;
  onChange: (mode: CompressionMode) => void;
  disabled?: boolean;
}

export function CompressModeSelector({ value, onChange, disabled }: CompressModeSelectorProps) {
  return (
    <fieldset disabled={disabled}>
      <legend className="mb-3 flex items-center gap-2 text-base font-bold text-foreground">
        <LayersIcon className="size-5 text-primary" />
        Compression Mode
      </legend>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {OPTIONS.map(({ id, title, description, recommended, Icon }) => {
          const checked = value === id;
          return (
            <label key={id} className="relative block cursor-pointer">
              <input
                type="radio"
                name="compression-mode"
                value={id}
                checked={checked}
                onChange={() => onChange(id)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "relative flex h-full flex-col gap-1.5 rounded-xl border p-4 text-left transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
                  checked ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-primary/40",
                )}
              >
                {recommended ? (
                  <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                    Recommended
                  </span>
                ) : null}
                <span className="flex items-center gap-2">
                  <Icon className="size-5 text-primary" />
                  <span className="text-sm font-bold text-foreground">{title}</span>
                </span>
                <span className="text-xs leading-snug text-muted-foreground">{description}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}