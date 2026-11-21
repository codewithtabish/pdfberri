"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { cn } from "@/lib/utils";
import { SPLIT_CONFIG, SPLIT_UI } from "./split-constants";
import { renderThumbnail } from "./split-pdf";
import type { RenderQueue } from "./split-utils";
import { AlertCircleIcon, CheckIcon } from "@/components/general/icons/pdf-icons";

interface SplitPageThumbnailProps {
  pdf: PDFDocumentProxy;
  queue: RenderQueue;
  pageNumber: number;
  selected: boolean;
  interactive: boolean;
  badge?: string;
  onToggle: (page: number) => void;
}

type RenderState = "idle" | "loading" | "ready" | "error";

export function SplitPageThumbnail({
  pdf,
  queue,
  pageNumber,
  selected,
  interactive,
  badge,
  onToggle,
}: SplitPageThumbnailProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<RenderState>("idle");

  // Only render pages near the viewport; free them again when scrolled far away.
  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "600px 0px",
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!visible || !canvas) return;
    setState("loading");
    const job = queue.enqueue((signal) => renderThumbnail(pdf, pageNumber, canvas, SPLIT_CONFIG.thumbnailWidth, signal));
    job.promise
      .then(() => setState("ready"))
      .catch(() => {
        if (!job.signal.aborted) setState("error");
      });
    return () => {
      job.cancel();
      canvas.width = 0;
      canvas.height = 0;
      setState("idle");
    };
  }, [visible, pdf, pageNumber, queue]);

  const preview = (
    <>
      <span
        className={cn(
          "relative block aspect-3/4 w-full overflow-hidden rounded-lg border bg-white transition-colors",
          selected ? "border-primary ring-2 ring-primary/40" : "border-border",
          interactive && !selected && "group-hover:border-primary/50",
        )}
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={cn("absolute inset-0 size-full object-contain transition-opacity duration-200", state === "ready" ? "opacity-100" : "opacity-0")}
        />
        {state === "loading" || state === "idle" ? (
          <span className="absolute inset-0 animate-pulse bg-muted motion-reduce:animate-none" aria-hidden="true" />
        ) : null}
        {state === "error" ? (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
            <AlertCircleIcon className="size-5" />
            Preview unavailable
          </span>
        ) : null}
        {interactive ? (
          <span
            aria-hidden="true"
            className={cn(
              "absolute left-2 top-2 flex size-5 items-center justify-center rounded-md border bg-white text-white shadow-sm",
              selected ? "border-primary bg-primary" : "border-border",
            )}
          >
            {selected ? <CheckIcon className="size-3.5" /> : null}
          </span>
        ) : null}
        {badge ? (
          <span className="absolute right-1.5 top-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
            {badge}
          </span>
        ) : null}
      </span>
      <span className={cn("mt-1.5 block text-center text-xs tabular-nums", selected ? "font-bold text-primary" : "text-muted-foreground")}>
        {pageNumber}
      </span>
    </>
  );

  return (
    <div ref={rootRef}>
      {interactive ? (
        <button
          type="button"
          role="checkbox"
          aria-checked={selected}
          aria-label={`Page ${pageNumber}`}
          onClick={() => onToggle(pageNumber)}
          className={cn("group block w-full rounded-lg text-left", SPLIT_UI.focusRing)}
        >
          {preview}
        </button>
      ) : (
        <div role="img" aria-label={badge ? `Page ${pageNumber}, ${badge}` : `Page ${pageNumber}`}>
          {preview}
        </div>
      )}
    </div>
  );
}
