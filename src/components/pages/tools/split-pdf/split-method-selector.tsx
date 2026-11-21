"use client";

import { cn } from "@/lib/utils";
import { SPLIT_METHODS } from "./split-constants";
import type { SplitMethod } from "./split-types";

interface SplitMethodSelectorProps {
  value: SplitMethod;
  onChange: (method: SplitMethod) => void;
}

export function SplitMethodSelector({ value, onChange }: SplitMethodSelectorProps) {
  return (
    <fieldset>
      <legend className="mb-3 text-base font-bold text-foreground">How would you like to split your PDF?</legend>
      <div className="grid grid-cols-2 gap-2.5">
        {SPLIT_METHODS.map(({ id, title, description, Icon }) => {
          const checked = value === id;
          return (
            <label key={id} className="relative block cursor-pointer">
              <input
                type="radio"
                name="split-method"
                value={id}
                checked={checked}
                onChange={() => onChange(id)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "flex h-full flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
                  checked ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-primary/40",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute right-2 top-2 flex size-4 items-center justify-center rounded-full border",
                    checked ? "border-primary bg-primary" : "border-border bg-card",
                  )}
                >
                  {checked ? <span className="size-1.5 rounded-full bg-primary-foreground" /> : null}
                </span>
                <Icon className="size-6 text-primary" />
                <span className="text-[13px] font-bold leading-tight text-foreground">{title}</span>
                <span className="text-[11px] leading-snug text-muted-foreground">{description}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
