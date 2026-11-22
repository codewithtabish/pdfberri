"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";

import { cn } from "@/lib/utils";
import { CheckIcon } from "@/components/general/icons/pdf-icons";
import { PDF_TO_JPG_CONFIG } from "./pdf-to-jpg-config";

interface PageCardProps {
  pdf: PDFDocumentProxy;
  pageIndex: number;
  selected: boolean;
  interactive: boolean;
  onToggle: (index: number) => void;
}

type PreviewState = "idle" | "loading" | "ready" | "error";

export function PdfToJpgPageCard({
  pdf,
  pageIndex,
  selected,
  interactive,
  onToggle,
}: PageCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [state, setState] = useState<PreviewState>("idle");

  useEffect(() => {
    let active = true;
    let renderTask: RenderTask | null = null;

    async function renderPreview() {
      const canvas = canvasRef.current;

      if (!canvas) return;

      setState("loading");

      try {
        const page = await pdf.getPage(pageIndex + 1);

        if (!active) {
          page.cleanup();
          return;
        }

        const viewport = page.getViewport({ scale: 1 });

        const thumbnailWidth = PDF_TO_JPG_CONFIG.thumbnailWidth;
        const scale = thumbnailWidth / viewport.width;

        const scaledViewport = page.getViewport({ scale });

        const width = Math.ceil(scaledViewport.width);
        const height = Math.ceil(scaledViewport.height);

        if (
          !Number.isFinite(width) ||
          !Number.isFinite(height) ||
          width <= 0 ||
          height <= 0
        ) {
          throw new Error("Invalid thumbnail dimensions.");
        }

        const context = canvas.getContext("2d", {
          alpha: false,
        });

        if (!context) {
          throw new Error("Could not create thumbnail canvas context.");
        }

        canvas.width = width;
        canvas.height = height;

        renderTask = page.render({
          canvas,
          canvasContext: context,
          viewport: scaledViewport,
        });

        await renderTask.promise;

        if (active) {
          setState("ready");
        }

        page.cleanup();
      } catch (error: unknown) {
        if (!active) return;

        const isCancelled =
          error instanceof Error &&
          error.name === "RenderingCancelledException";

        if (!isCancelled) {
          setState("error");
        }
      }
    }

    void renderPreview();

    return () => {
      active = false;

      if (renderTask) {
        renderTask.cancel();
      }

      const canvas = canvasRef.current;

      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    };
  }, [pdf, pageIndex]);

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-label={`Page ${pageIndex + 1}${selected ? ", selected" : ""}`}
      disabled={!interactive}
      onClick={() => onToggle(pageIndex)}
      className={cn(
        "group relative flex flex-col items-center rounded-xl border p-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border bg-card hover:border-primary/40",
        !interactive && "cursor-default opacity-80"
      )}
    >
      <div className="relative aspect-3/4 w-full overflow-hidden rounded-lg bg-muted">
        <canvas
          ref={canvasRef}
          className={cn(
            "absolute inset-0 size-full object-contain transition-opacity duration-200",
            state === "ready" ? "opacity-100" : "opacity-0"
          )}
        />

        {(state === "loading" || state === "idle") && (
          <div className="absolute inset-0 animate-pulse bg-muted-foreground/10" />
        )}

        {state === "error" && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            Preview unavailable
          </div>
        )}

        {interactive && (
          <div
            className={cn(
              "absolute left-2 top-2 flex size-5 items-center justify-center rounded border bg-white text-white shadow-sm",
              selected ? "border-primary bg-primary" : "border-border"
            )}
          >
            {selected && <CheckIcon className="size-3.5" />}
          </div>
        )}
      </div>

      <span className="mt-2 text-xs font-semibold text-foreground">
        Page {pageIndex + 1}
      </span>
    </button>
  );
}