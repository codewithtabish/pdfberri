"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { cn } from "@/lib/utils";
import { ROTATE_CONFIG } from "./rotate-config";
import { CheckIcon, RotateCwIcon } from "@/components/general/icons/pdf-icons";

interface RotatePageThumbnailProps {
  pdf: PDFDocumentProxy;
  pageIndex: number;
  currentRotation: number;
  selected: boolean;
  interactive: boolean;
  onToggle: (index: number) => void;
}

export function RotatePageThumbnail({ 
  pdf, 
  pageIndex, 
  currentRotation, 
  selected, 
  interactive, 
  onToggle 
}: RotatePageThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderState, setRenderState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [originalRotation, setOriginalRotation] = useState(0);

  useEffect(() => {
    let active = true;
    let renderTask: any = null;

    async function render() {
      if (!canvasRef.current || !pdf) return;
      setRenderState("loading");
      try {
        const page = await pdf.getPage(pageIndex + 1);
        if (!active) return;
        
        const rotation = page.rotate;
        setOriginalRotation(rotation);

        const viewport = page.getViewport({ scale: 1, rotation: (rotation + currentRotation) % 360 });
        const scale = ROTATE_CONFIG.thumbnailWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale, rotation: (rotation + currentRotation) % 360 });

        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Match the canvas resolution to the viewport to prevent blurring
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        // PDF.js v4+ requires 'canvas' directly in RenderParameters
        renderTask = page.render({ canvas, viewport: scaledViewport });
        await renderTask.promise;
        if (active) setRenderState("ready");
      } catch (err: any) {
        // Ignore cancellation errors from the cleanup function
        if (active && err?.name !== "RenderingCancelledException") {
          setRenderState("error");
        }
      }
    }

    render();

    return () => {
      active = false;
      if (renderTask) renderTask.cancel();
    };
  }, [pdf, pageIndex, currentRotation]);

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      disabled={!interactive}
      onClick={() => onToggle(pageIndex)}
      className={cn(
        "group relative flex flex-col items-center rounded-xl border p-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-primary/40",
        !interactive && "cursor-default"
      )}
    >
      <div className="relative aspect-3/4 w-full overflow-hidden rounded-lg bg-muted">
        <canvas
          ref={canvasRef}
          className={cn(
            "absolute inset-0 size-full object-contain transition-opacity duration-200",
            renderState === "ready" ? "opacity-100" : "opacity-0"
          )}
        />
        {(renderState === "loading" || renderState === "idle") && (
          <div className="absolute inset-0 animate-pulse bg-muted-foreground/10" />
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

        {currentRotation !== 0 && (
          <div className="absolute right-2 top-2 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
            +{currentRotation}°
          </div>
        )}
      </div>
      <div className="mt-2 flex w-full items-center justify-between px-1">
        <span className="text-xs font-semibold text-foreground">Page {pageIndex + 1}</span>
        <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
          <RotateCwIcon className="size-3" />
          {(originalRotation + currentRotation) % 360}°
        </span>
      </div>
    </button>
  );
}