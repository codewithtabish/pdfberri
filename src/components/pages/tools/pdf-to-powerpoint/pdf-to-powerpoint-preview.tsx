"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronRightIcon,
  LoaderIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "@/components/general/icons/pdf-icons";
import { PREVIEW_DPI } from "./pdf-to-powerpoint-constants";
import { buildSlideModel, resolveSlideSize } from "./pdf-to-powerpoint-engine";
import { loadPdfjs } from "./pdf-to-powerpoint-pdfjs";
import { drawSlideModel } from "./pdf-to-powerpoint-preview-renderer";
import type { ConversionSettings, SlideModel } from "./pdf-to-powerpoint-types";

interface Props {
  doc: PDFDocumentProxy;
  pages: number[]; // selected zero-based indexes, ascending
  settings: ConversionSettings;
}

const ZOOMS = [50, 75, 100, 150, 200];

export function PdfToPowerpointPreview({ doc, pages, settings }: Props) {
  const [position, setPosition] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [model, setModel] = useState<SlideModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const safePosition = Math.min(position, Math.max(0, pages.length - 1));
  const pageIndex = pages[safePosition];

  useEffect(() => {
    if (pageIndex === undefined) {
      setModel(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setFailed(false);

    const timer = window.setTimeout(async () => {
      try {
        const first = pages[0] ?? pageIndex;
        const [pdfjs, slide] = await Promise.all([
          loadPdfjs(),
          resolveSlideSize(doc, first, settings.slideSize),
        ]);
        const page = await doc.getPage(pageIndex + 1);
        try {
          const next = await buildSlideModel(page, pageIndex, {
            slide,
            settings,
            dpi: PREVIEW_DPI,
            signal: controller.signal,
            pdfjs,
          });
          if (!controller.signal.aborted) setModel(next);
        } finally {
          page.cleanup();
        }
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [doc, pages, pageIndex, settings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !model) return;
    let current = true;
    void drawSlideModel(canvas, model, zoom > 100 ? 1280 : 960, () => current);
    return () => {
      current = false;
    };
  }, [model, zoom]);

  if (pages.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Select at least one page to see the slide preview.
      </div>
    );
  }

  const zoomIndex = ZOOMS.indexOf(zoom);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-foreground">PowerPoint preview</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            aria-label="Zoom out"
            disabled={zoomIndex <= 0}
            onClick={() => setZoom(ZOOMS[Math.max(0, zoomIndex - 1)] ?? 100)}
          >
            <ZoomOutIcon className="size-4" />
          </Button>
          <span className="w-12 text-center text-xs font-semibold text-foreground">{zoom}%</span>
          <Button
            variant="outline"
            size="icon"
            aria-label="Zoom in"
            disabled={zoomIndex >= ZOOMS.length - 1}
            onClick={() => setZoom(ZOOMS[Math.min(ZOOMS.length - 1, zoomIndex + 1)] ?? 100)}
          >
            <ZoomInIcon className="size-4" />
          </Button>
        </div>
      </div>

      <div className="relative max-h-[28rem] overflow-auto rounded-lg border border-border bg-muted">
        <canvas
          ref={canvasRef}
          style={{ width: `${zoom}%` }}
          className={cn("block max-w-none", !model && "hidden")}
          aria-label={`Preview of slide ${safePosition + 1}`}
        />
        {(loading || !model) && !failed && (
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            <LoaderIcon className="size-6 animate-spin motion-reduce:animate-none" />
          </div>
        )}
        {failed && (
          <p className="p-6 text-center text-sm text-destructive">This slide couldn&apos;t be previewed.</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={safePosition === 0}
          onClick={() => setPosition(safePosition - 1)}
        >
          <ChevronRightIcon className="size-4 rotate-180" />
          Previous
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Slide {safePosition + 1} of {pages.length} · PDF page {(pageIndex ?? 0) + 1}
          {model && ` · ${model.size.width.toFixed(2)}×${model.size.height.toFixed(2)} in`}
          {model && ` · ${model.fidelity === "editable" ? "editable" : "image slide"}`}
        </p>
        <Button
          variant="outline"
          size="sm"
          disabled={safePosition >= pages.length - 1}
          onClick={() => setPosition(safePosition + 1)}
        >
          Next
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      {model && model.warnings.length > 0 && (
        <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
          {model.warnings.map((warning) => (
            <li key={warning}>• {warning}</li>
          ))}
        </ul>
      )}

      <div className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Slides">
        {pages.map((page, i) => (
          <button
            key={page}
            type="button"
            role="tab"
            aria-selected={i === safePosition}
            onClick={() => setPosition(i)}
            className={cn(
              "shrink-0 rounded-md border px-2.5 py-1 text-xs font-semibold",
              i === safePosition
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Preview is drawn from the same conversion data used to build the PPTX. PowerPoint&apos;s own
        rendering may differ slightly.
      </p>
    </div>
  );
}
