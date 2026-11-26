"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/general/icons/pdf-icons";
import { getThumbnail } from "./pdf-to-powerpoint-pdfjs";

interface Props {
  doc: PDFDocumentProxy;
  selected: number[];
  rangeText: string;
  rangeError: string | null;
  disabled: boolean;
  onToggle: (index: number) => void;
  onSelectAll: () => void;
  onClear: () => void;
  onRange: (text: string) => void;
}

function Thumb({
  doc,
  index,
  checked,
  disabled,
  onToggle,
}: {
  doc: PDFDocumentProxy;
  index: number;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    getThumbnail(doc, index)
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [visible, doc, index]);

  return (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={`Page ${index + 1}`}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "relative flex aspect-[3/4] flex-col items-center justify-end overflow-hidden rounded-lg border-2 bg-muted p-1 transition-colors",
        checked ? "border-primary" : "border-border opacity-70 hover:opacity-100",
      )}
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
      )}
      <span
        className={cn(
          "absolute left-1 top-1 flex size-5 items-center justify-center rounded border",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
        )}
      >
        {checked && <CheckIcon className="size-3.5" />}
      </span>
      <span className="relative rounded-full bg-card px-2 text-xs font-semibold text-foreground">
        {index + 1}
      </span>
    </button>
  );
}

export function PdfToPowerpointPageSelector(props: Props) {
  const { doc, selected, rangeText, rangeError, disabled } = props;
  const chosen = new Set(selected);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-foreground">Select PDF pages</h3>
        <span className="text-xs font-semibold text-muted-foreground">
          {selected.length} of {doc.numPages} selected
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" disabled={disabled} onClick={props.onSelectAll}>
          Select all
        </Button>
        <Button variant="outline" size="sm" disabled={disabled} onClick={props.onClear}>
          Clear
        </Button>
        <input
          value={rangeText}
          disabled={disabled}
          onChange={(e) => props.onRange(e.target.value)}
          placeholder="e.g. 1,3,5-8,12"
          aria-label="Page ranges"
          aria-invalid={rangeError !== null}
          className="h-8 min-w-0 flex-1 rounded-md border border-input bg-card px-3 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      {rangeError && <p className="text-xs text-destructive">{rangeError}</p>}

      <div className="grid max-h-96 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
        {Array.from({ length: doc.numPages }, (_, index) => (
          <Thumb
            key={index}
            doc={doc}
            index={index}
            checked={chosen.has(index)}
            disabled={disabled}
            onToggle={() => props.onToggle(index)}
          />
        ))}
      </div>
    </div>
  );
}
