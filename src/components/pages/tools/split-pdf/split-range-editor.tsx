"use client";

import { InfoIcon, PlusIcon, TrashIcon } from "@/components/general/icons/pdf-icons";
import { SPLIT_UI } from "./split-constants";
import type { PageRangeInput } from "./split-types";

interface SplitRangeEditorProps {
  ranges: readonly PageRangeInput[];
  pageCount: number;
  onAdd: () => void;
  onChange: (id: string, field: "start" | "end", value: string) => void;
  onRemove: (id: string) => void;
}

export function SplitRangeEditor({ ranges, pageCount, onAdd, onChange, onRemove }: SplitRangeEditorProps) {
  return (
    <section aria-labelledby="split-ranges-heading" className="space-y-2.5">
      <h3 id="split-ranges-heading" className="flex items-center gap-1.5 text-sm font-bold text-foreground">
        Page ranges
        <span title={`Ranges can't overlap. Pages 1–${pageCount} are available.`}>
          <InfoIcon className="size-4 text-muted-foreground" />
          <span className="sr-only">Ranges can&apos;t overlap. Pages 1 to {pageCount} are available.</span>
        </span>
      </h3>

      <ul className="space-y-2">
        {ranges.map((range, index) => (
          <li key={range.id} className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={range.start}
              onChange={(event) => onChange(range.id, "start", event.target.value)}
              aria-label={`Range ${index + 1} first page`}
              className={SPLIT_UI.input}
            />
            <span aria-hidden="true" className="text-muted-foreground">–</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={range.end}
              onChange={(event) => onChange(range.id, "end", event.target.value)}
              aria-label={`Range ${index + 1} last page`}
              className={SPLIT_UI.input}
            />
            <button
              type="button"
              onClick={() => onRemove(range.id)}
              disabled={ranges.length === 1}
              aria-label={`Remove range ${index + 1}`}
              className={`${SPLIT_UI.dangerButton} shrink-0 px-2!`}
            >
              <TrashIcon className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      <button type="button" onClick={onAdd} className={SPLIT_UI.textButton}>
        <PlusIcon className="size-4" />
        Add range
      </button>
    </section>
  );
}
