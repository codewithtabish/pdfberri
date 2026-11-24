// src/components/pages/tools/edit-pdf/edit-pdf-page-canvas.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { ActiveTool, EditableObject, PDFPageState, PageId } from './edit-pdf-types';
import { canvasToPdf } from './edit-pdf-coordinates';
import { uid } from './edit-pdf-utils';
import { renderPageToCanvas } from './edit-pdf-renderer';

interface Props {
  pdfDoc: PDFDocumentProxy | null;
  pageState: PDFPageState;
  zoom: number;
  activeTool: ActiveTool;
  selectedObjectId: string | null;
  onSelect: (id: string | null) => void;
  onPlaceObject: (tool: ActiveTool, x: number, y: number) => void;
  onDrawAnnotation: (obj: EditableObject) => void;
  onUpdateObject: (id: string, patch: Partial<EditableObject>) => void;
}

export function EditPdfPageCanvas({
  pdfDoc, pageState, zoom, activeTool, selectedObjectId,
  onSelect, onPlaceObject, onDrawAnnotation,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const [freehand, setFreehand] = useState<{ x: number; y: number }[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!pdfDoc || !canvasRef.current) return;
      try {
        const page = await pdfDoc.getPage(pageState.originalIndex + 1);
        if (!cancelled && canvasRef.current) {
          await renderPageToCanvas(page, canvasRef.current, zoom);
        }
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [pdfDoc, pageState.originalIndex, zoom]);

  const pointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const pdf = canvasToPdf(cx, cy, pageState.height, zoom);

    if (activeTool === 'select') {
      const el = (e.target as HTMLElement).closest('[data-object-id]');
      onSelect(el?.getAttribute('data-object-id') ?? null);
      return;
    }
    if (['text', 'image', 'sign', 'comment', 'link'].includes(activeTool)) {
      onPlaceObject(activeTool, pdf.x, pdf.y);
      return;
    }
    if (activeTool === 'draw') {
      setFreehand([pdf]);
      return;
    }
    if (['highlight', 'underline', 'strikethrough', 'rectangle', 'circle', 'line', 'arrow', 'whiteout'].includes(activeTool)) {
      setDragStart({ x: cx, y: cy });
      setDragCurrent({ x: cx, y: cy });
    }
  }, [activeTool, pageState.height, zoom, onSelect, onPlaceObject]);

  const pointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    if (freehand) {
      const pdf = canvasToPdf(cx, cy, pageState.height, zoom);
      setFreehand((prev) => (prev ? [...prev, pdf] : prev));
      return;
    }
    if (dragStart) setDragCurrent({ x: cx, y: cy });
  }, [freehand, dragStart, pageState.height, zoom]);

  const pointerUp = useCallback(() => {
    if (freehand && freehand.length > 1) {
      const xs = freehand.map((p) => p.x);
      const ys = freehand.map((p) => p.y);
      const minX = Math.min(...xs); const maxX = Math.max(...xs);
      const minY = Math.min(...ys); const maxY = Math.max(...ys);
      onDrawAnnotation({
        id: uid(), pageId: pageState.id, type: 'annotation', shape: 'draw',
        x: minX, y: maxY, width: maxX - minX, height: maxY - minY,
        rotation: 0, opacity: 1, color: '#111827', lineWidth: 2,
        points: freehand,
      });
    }
    setFreehand(null);

    if (dragStart && dragCurrent) {
      const dx = Math.abs(dragCurrent.x - dragStart.x);
      const dy = Math.abs(dragCurrent.y - dragStart.y);
      if (dx > 3 && dy > 3) {
        const tl = canvasToPdf(Math.min(dragStart.x, dragCurrent.x), Math.min(dragStart.y, dragCurrent.y), pageState.height, zoom);
        const br = canvasToPdf(Math.max(dragStart.x, dragCurrent.x), Math.max(dragStart.y, dragCurrent.y), pageState.height, zoom);
        const color =
          activeTool === 'highlight' ? '#fde047'
          : activeTool === 'whiteout' ? '#ffffff'
          : '#2563eb';
        onDrawAnnotation({
          id: uid(), pageId: pageState.id, type: 'annotation',
          shape: activeTool as any,
          x: tl.x, y: tl.y,
          width: Math.abs(br.x - tl.x),
          height: Math.abs(br.y - tl.y),
          rotation: 0, opacity: activeTool === 'highlight' ? 0.4 : 1,
          color, lineWidth: 2,
        });
      }
    }
    setDragStart(null); setDragCurrent(null);
  }, [freehand, dragStart, dragCurrent, activeTool, pageState, zoom, onDrawAnnotation]);

  const isCrosshair = activeTool !== 'select';

  return (
    <div
      ref={containerRef}
      className={`relative inline-block select-none bg-white shadow-lg ${isCrosshair ? 'cursor-crosshair' : 'cursor-default'}`}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerLeave={() => { setDragStart(null); setDragCurrent(null); setFreehand(null); }}
    >
      <canvas ref={canvasRef} className="block" />
      {pageState.objects.map((obj) => (
        <ObjectOverlay key={obj.id} obj={obj} pageHeight={pageState.height} zoom={zoom} selected={obj.id === selectedObjectId} />
      ))}
      {dragStart && dragCurrent && (
        <div className="pointer-events-none absolute border-2 border-primary bg-primary/10"
          style={{
            left: Math.min(dragStart.x, dragCurrent.x),
            top: Math.min(dragStart.y, dragCurrent.y),
            width: Math.abs(dragCurrent.x - dragStart.x),
            height: Math.abs(dragCurrent.y - dragStart.y),
          }}
        />
      )}
    </div>
  );
}

function ObjectOverlay({ obj, pageHeight, zoom, selected }: { obj: EditableObject; pageHeight: number; zoom: number; selected: boolean }) {
  const base: React.CSSProperties = {
    position: 'absolute',
    left: obj.x * zoom,
    top: (pageHeight - obj.y - obj.height) * zoom,
    width: obj.width * zoom,
    height: obj.height * zoom,
    opacity: obj.opacity,
    outline: selected ? '2px solid hsl(var(--primary))' : 'none',
    transform: obj.rotation ? `rotate(${obj.rotation}deg)` : undefined,
  };

  if (obj.type === 'text') {
    return (
      <div data-object-id={obj.id}
        style={{ ...base, color: obj.color, fontSize: obj.fontSize * zoom,
          fontWeight: obj.bold ? 'bold' : 'normal', fontStyle: obj.italic ? 'italic' : 'normal',
          textDecoration: obj.underline ? 'underline' : 'none',
          whiteSpace: 'pre-wrap', lineHeight: 1.2 }}
      >{obj.text}</div>
    );
  }
  if (obj.type === 'image' || obj.type === 'signature') {
    return <img data-object-id={obj.id} src={obj.src} alt="" style={{ ...base, objectFit: 'contain' }} draggable={false} />;
  }
  if (obj.type === 'annotation') {
    const isLine = obj.shape === 'line' || obj.shape === 'arrow';
    if (obj.shape === 'draw' && obj.points) {
      // use CSS SVG path
      const path = obj.points.map((p, i) => {
        const lx = (p.x - obj.x) * zoom;
        const ly = (obj.y - p.y) * zoom;
        return `${i === 0 ? 'M' : 'L'}${lx},${ly}`;
      }).join(' ');
      return (
        <svg data-object-id={obj.id} style={{ ...base, overflow: 'visible' }}>
          <path d={path} stroke={obj.color} strokeWidth={obj.lineWidth} fill="none" />
        </svg>
      );
    }
    return (
      <div data-object-id={obj.id}
        style={{
          ...base,
          border: isLine ? undefined : `2px solid ${obj.color}`,
          borderRadius: obj.shape === 'circle' ? '50%' : 0,
          background: obj.shape === 'highlight' ? `${obj.color}66`
            : obj.shape === 'whiteout' ? '#ffffff' : 'transparent',
          boxSizing: 'border-box',
        }}
      />
    );
  }
  if (obj.type === 'comment') {
    return (
      <div data-object-id={obj.id} style={{ ...base, background: obj.color, borderRadius: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12 }}>
        !
      </div>
    );
  }
  if (obj.type === 'link') {
    return <div data-object-id={obj.id} style={{ ...base, border: '1px dashed #2563eb' }} />;
  }
  return <div data-object-id={obj.id} style={base} />;
}