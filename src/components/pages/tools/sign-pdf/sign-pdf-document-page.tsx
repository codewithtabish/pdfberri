"use client";
import { useEffect, useRef, useState } from "react";
import type * as pdfjsLib from "pdfjs-dist";
import type { PlacedElement } from "./sign-pdf-types";
import { SignPdfPlacementLayer } from "./sign-pdf-placement-layer";

interface Props {
  pdfDoc: pdfjsLib.PDFDocumentProxy; pageIndex: number; zoom: number;
  elements: PlacedElement[]; selectedId: string | null;
  onSelect: (id: string | null) => void; onUpdate: (id: string, updates: Partial<PlacedElement>) => void; onDelete: (id: string) => void;
}

export function SignPdfDocumentPage({ pdfDoc, pageIndex, zoom, elements, selectedId, onSelect, onUpdate, onDelete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const page = await pdfDoc.getPage(pageIndex + 1);
      if (cancelled) return;
      const vp = page.getViewport({ scale: zoom });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = vp.width * dpr; canvas.height = vp.height * dpr;
      canvas.style.width = `${vp.width}px`; canvas.style.height = `${vp.height}px`;
      setDims({ w: vp.width, h: vp.height });
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      try { renderTaskRef.current?.cancel(); } catch {}
      const task = page.render({ canvasContext: ctx, canvas, viewport: vp });
      renderTaskRef.current = task;
      try { await task.promise; } catch {}
    })();
    return () => { cancelled = true; try { renderTaskRef.current?.cancel(); } catch {} };
  }, [pdfDoc, pageIndex, zoom]);

  return (
    <div ref={containerRef} className="relative mx-auto bg-white shadow-md ring-1 ring-black/5" style={{ width: dims.w, height: dims.h }}>
      <canvas ref={canvasRef} className="block" />
      {dims.w > 0 && <SignPdfPlacementLayer pageIndex={pageIndex} elements={elements} selectedId={selectedId} onSelect={onSelect} onUpdate={onUpdate} onDelete={onDelete} containerRef={containerRef} />}
    </div>
  );
}