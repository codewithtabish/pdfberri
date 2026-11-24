"use client";
// src/components/pages/tools/annotate-pdf/annotate-pdf-page.tsx
import { useEffect, useRef, useState } from "react";
import type * as pdfjsLib from "pdfjs-dist";
import type { Annotation, Point, ToolId, ToolSettings } from "./annotate-pdf-types";
import { drawAnnotations } from "./annotate-pdf-annotation-renderer";
import { screenToPageNorm } from "./annotate-pdf-utils";

type Props = {
  pdf: pdfjsLib.PDFDocumentProxy;
  pageIndex: number;
  zoom: number;
  tool: ToolId;
  settings: ToolSettings;
  annotations: Annotation[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onCommit: (a: Annotation) => void;
  onErase: (id: string) => void;
};

export function AnnotatePdfPage({
  pdf,
  pageIndex,
  zoom,
  tool,
  settings,
  annotations,
  selectedId,
  onSelect,
  onCommit,
  onErase,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [drawing, setDrawing] = useState<Annotation | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  // Render the PDF page
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const page = await pdf.getPage(pageIndex + 1);
      if (cancelled) return;
      const vp = page.getViewport({ scale: zoom, rotation: page.rotate });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const canvas = canvasRef.current;
      const overlay = overlayRef.current;
      const container = containerRef.current;
      if (!canvas || !overlay || !container) return;

      container.style.width = `${vp.width}px`;
      container.style.height = `${vp.height}px`;
      canvas.width = Math.floor(vp.width * dpr);
      canvas.height = Math.floor(vp.height * dpr);
      canvas.style.width = `${vp.width}px`;
      canvas.style.height = `${vp.height}px`;
      overlay.width = Math.floor(vp.width * dpr);
      overlay.height = Math.floor(vp.height * dpr);
      overlay.style.width = `${vp.width}px`;
      overlay.style.height = `${vp.height}px`;
      setDims({ w: vp.width, h: vp.height });

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      try {
        renderTaskRef.current?.cancel();
      } catch {
        /* ignore */
      }

      const task = page.render({
        canvasContext: ctx,
        canvas, // v6 requires this
        viewport: vp,
      });
      renderTaskRef.current = task;

      try {
        await task.promise;
      } catch {
        /* cancelled */
      }
    })();

    return () => {
      cancelled = true;
      try {
        renderTaskRef.current?.cancel();
      } catch {
        /* ignore */
      }
      renderTaskRef.current = null;
    };
  }, [pdf, pageIndex, zoom]);

  // Redraw annotation overlay whenever annotations change
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ctx = overlay.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    drawAnnotations(ctx, annotations, pageIndex, dims.w, dims.h);
    if (drawing) drawAnnotations(ctx, [drawing], pageIndex, dims.w, dims.h);
  }, [annotations, drawing, dims, pageIndex]);

  const getNorm = (e: React.PointerEvent | PointerEvent) => {
    const el = overlayRef.current!;
    return screenToPageNorm(e.clientX, e.clientY, el.getBoundingClientRect());
  };

  const startPoint = useRef<Point | null>(null);
  const freehandPoints = useRef<Point[]>([]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (tool === "hand") return;
    if (!overlayRef.current) return;
    overlayRef.current.setPointerCapture(e.pointerId);
    const p = getNorm(e);
    startPoint.current = p;

    if (tool === "select") {
      const hit = hitTest(annotations, pageIndex, p);
      onSelect(hit?.id ?? null);
      return;
    }
    if (tool === "eraser") {
      const hit = hitTest(annotations, pageIndex, p);
      if (hit) onErase(hit.id);
      return;
    }
    if (tool === "pen") {
      freehandPoints.current = [p];
      const a: Annotation = {
        id: "live",
        kind: "freehand",
        pageIndex,
        points: [p],
        color: settings.color,
        width: settings.strokeWidth,
        opacity: settings.opacity,
        createdAt: Date.now(),
      };
      setDrawing(a);
      return;
    }
    if (tool === "comment") {
      const a: Annotation = {
        id: crypto.randomUUID(),
        kind: "comment",
        pageIndex,
        x: p.x,
        y: p.y,
        text: "New comment",
        color: "#fde68a",
        createdAt: Date.now(),
      };
      onCommit(a);
      onSelect(a.id);
      return;
    }
    if (tool === "text") {
      const text = window.prompt("Enter text");
      if (!text) return;
      const a: Annotation = {
        id: crypto.randomUUID(),
        kind: "text",
        pageIndex,
        x: p.x,
        y: p.y,
        w: 0.3,
        h: 0.05,
        text,
        fontSize: settings.fontSize,
        color: "#111827",
        background: "#ffffffcc",
        createdAt: Date.now(),
      };
      onCommit(a);
      onSelect(a.id);
      return;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!startPoint.current) return;
    const p = getNorm(e);
    if (tool === "pen" && drawing) {
      freehandPoints.current.push(p);
      setDrawing({ ...(drawing as Extract<Annotation, { kind: "freehand" }>), points: [...freehandPoints.current] });
      return;
    }
    const s = startPoint.current;

    if (tool === "highlight" || tool === "underline" || tool === "strikethrough") {
      const x1 = Math.min(s.x, p.x),
        y1 = Math.min(s.y, p.y);
      const w = Math.abs(p.x - s.x),
        h = Math.abs(p.y - s.y);
      if (tool === "highlight") {
        setDrawing({
          id: "live",
          kind: "highlight",
          pageIndex,
          regions: [{ x: x1, y: y1, w, h }],
          color: settings.color,
          opacity: settings.opacity,
          createdAt: Date.now(),
        });
      } else {
        setDrawing({
          id: "live",
          kind: tool,
          pageIndex,
          segments: [{ x1: s.x, y1: p.y, x2: p.x, y2: p.y }],
          color: settings.color,
          thickness: settings.strokeWidth,
          opacity: settings.opacity,
          createdAt: Date.now(),
        });
      }
      return;
    }
    if (tool === "rect" || tool === "circle") {
      const x = Math.min(s.x, p.x),
        y = Math.min(s.y, p.y);
      const w = Math.abs(p.x - s.x),
        h = Math.abs(p.y - s.y);
      setDrawing({
        id: "live",
        kind: tool,
        pageIndex,
        x,
        y,
        w,
        h,
        stroke: settings.color,
        fill: settings.fill,
        strokeWidth: settings.strokeWidth,
        opacity: settings.opacity,
        createdAt: Date.now(),
      });
      return;
    }
    if (tool === "arrow" || tool === "line") {
      setDrawing({
        id: "live",
        kind: tool,
        pageIndex,
        x1: s.x,
        y1: s.y,
        x2: p.x,
        y2: p.y,
        color: settings.color,
        strokeWidth: settings.strokeWidth,
        opacity: settings.opacity,
        createdAt: Date.now(),
      });
      return;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!startPoint.current) return;
    overlayRef.current?.releasePointerCapture(e.pointerId);
    const p = getNorm(e);
    const s = startPoint.current;
    startPoint.current = null;

    if (tool === "pen" && drawing) {
      const final: Annotation = {
        ...(drawing as Extract<Annotation, { kind: "freehand" }>),
        id: crypto.randomUUID(),
      };
      setDrawing(null);
      onCommit(final);
      return;
    }
    if (drawing) {
      const dx = Math.abs(p.x - s.x),
        dy = Math.abs(p.y - s.y);
      if (dx < 0.004 && dy < 0.004) {
        setDrawing(null);
        return;
      }
      const final = { ...(drawing as Annotation), id: crypto.randomUUID() };
      setDrawing(null);
      onCommit(final);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative mx-auto bg-white shadow-md ring-1 ring-black/5"
      style={{ touchAction: tool === "hand" ? "pan-x pan-y" : "none" }}
    >
      <canvas ref={canvasRef} className="block" />
      <canvas
        ref={overlayRef}
        className="absolute inset-0"
        style={{ cursor: cursorFor(tool) }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      {selectedId && (
        <SelectionRing
          annotations={annotations}
          pageIndex={pageIndex}
          id={selectedId}
          w={dims.w}
          h={dims.h}
        />
      )}
    </div>
  );
}

function cursorFor(tool: ToolId) {
  if (tool === "select") return "default";
  if (tool === "hand") return "grab";
  return "crosshair";
}

function hitTest(
  annotations: Annotation[],
  pageIndex: number,
  p: Point
): Annotation | null {
  for (let i = annotations.length - 1; i >= 0; i--) {
    const a = annotations[i];
    if (a.pageIndex !== pageIndex) continue;
    if (a.kind === "highlight") {
      if (a.regions.some((r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h)) return a;
    } else if (a.kind === "rect" || a.kind === "circle" || a.kind === "text") {
      if (p.x >= a.x && p.x <= a.x + a.w && p.y >= a.y && p.y <= a.y + a.h) return a;
    } else if (a.kind === "freehand") {
      if (a.points.some((pt) => Math.abs(pt.x - p.x) < 0.02 && Math.abs(pt.y - p.y) < 0.02)) return a;
    } else if (a.kind === "arrow" || a.kind === "line") {
      if (distToSegment(p, { x: a.x1, y: a.y1 }, { x: a.x2, y: a.y2 }) < 0.02) return a;
    } else if (a.kind === "comment") {
      if (Math.abs(a.x - p.x) < 0.03 && Math.abs(a.y - p.y) < 0.03) return a;
    } else if (a.kind === "underline" || a.kind === "strikethrough") {
      if (a.segments.some((s) => distToSegment(p, { x: s.x1, y: s.y1 }, { x: s.x2, y: s.y2 }) < 0.02)) return a;
    }
  }
  return null;
}

function distToSegment(p: Point, a: Point, b: Point) {
  const dx = b.x - a.x,
    dy = b.y - a.y;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const px = a.x + t * dx,
    py = a.y + t * dy;
  return Math.hypot(p.x - px, p.y - py);
}

function SelectionRing({
  annotations,
  pageIndex,
  id,
  w,
  h,
}: {
  annotations: Annotation[];
  pageIndex: number;
  id: string;
  w: number;
  h: number;
}) {
  const a = annotations.find((x) => x.id === id && x.pageIndex === pageIndex);
  if (!a) return null;
  let box = { x: 0, y: 0, w: 0, h: 0 };
  if (a.kind === "rect" || a.kind === "circle" || a.kind === "text") {
    box = { x: a.x, y: a.y, w: a.w, h: a.h };
  } else if (a.kind === "highlight") {
    const r = a.regions[0];
    if (!r) return null;
    box = r;
  } else if (a.kind === "comment") {
    box = { x: a.x, y: a.y, w: 0.03, h: 0.02 };
  } else {
    return null;
  }
  return (
    <div
      className="pointer-events-none absolute border-2 border-primary/80"
      style={{
        left: box.x * w,
        top: box.y * h,
        width: box.w * w,
        height: box.h * h,
      }}
    />
  );
}