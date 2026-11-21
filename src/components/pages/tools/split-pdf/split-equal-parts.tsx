"use client";

import { useId } from "react";
import { SPLIT_UI } from "./split-constants";

interface SplitEqualPartsProps {
  value: string;
  pageCount: number;
  onChange: (value: string) => void;
}

export function SplitEqualParts({ value, pageCount, onChange }: SplitEqualPartsProps) {
  const id = useId();
  return (
    <section aria-labelledby={`${id}-heading`} className="space-y-2">
      <h3 id={`${id}-heading`} className="text-sm font-bold text-foreground">
        Number of parts
      </h3>
      <label htmlFor={id} className="sr-only">
        Number of equal parts
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${SPLIT_UI.input} max-w-28`}
      />
      <p className="text-xs text-muted-foreground">
        Choose 2 to {pageCount}. If pages don&apos;t divide evenly, earlier parts get one extra page.
      </p>
    </section>
  );
}
