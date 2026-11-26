'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, MoveHorizontal, ZoomIn, ZoomOut } from 'lucide-react';
import type { PDFDocumentProxy } from 'pdfjs-dist';

interface Props {
  url: string;
  pageSheets: string[];
}

interface Cancelable {
  cancel: () => void;
  promise: Promise<unknown>;
}

function Thumb({ doc, pageNumber, active, onClick }: { doc: PDFDocumentProxy; pageNumber: number; active: boolean; onClick: () => void }) {
  const wrapRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    let task: Cancelable | null = null;
    const canvas = canvasRef.current;
    (async () => {
      const page = await doc.getPage(pageNumber);
      if (cancelled || !canvas) return;
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: 80 / base.width });
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      task = page.render({ canvasContext: ctx, viewport, canvas });
      try {
        await task.promise;
      } catch {
        // render cancelled
      }
    })();
    return () => {
      cancelled = true;
      task?.cancel();
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    };
  }, [visible, doc, pageNumber]);

  return (
    <button
      ref={wrapRef}
      onClick={onClick}
      className={`flex shrink-0 flex-col items-center gap-1 rounded-lg border p-1.5 ${
        active ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
      }`}
      aria-label={`Go to page ${pageNumber}`}
    >
      <div className="flex min-h-[100px] w-20 items-start justify-center bg-white">
        <canvas ref={canvasRef} className="max-w-full" />
      </div>
      <span className="text-[11px] text-muted-foreground">{pageNumber}</span>
    </button>
  );
}

export function ExcelPreview({ url, pageSheets }: Props) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [fitMode, setFitMode] = useState<'width' | 'page'>('width');
  const [width, setWidth] = useState(0);

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load the generated PDF
  useEffect(() => {
    let cancelled = false;
    let loading: { destroy: () => Promise<void> } | null = null;
    setDoc(null);
    setPage(1);
    setLoadError(null);

    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
        }
        const task = pdfjs.getDocument({ url });
        loading = task;
        const loaded = await task.promise;
        if (cancelled) {
          await task.destroy();
          return;
        }
        setDoc(loaded);
      } catch {
        if (!cancelled) setLoadError('The preview could not be loaded. You can still download the PDF.');
      }
    })();

    return () => {
      cancelled = true;
      void loading?.destroy();
    };
  }, [url]);

  // Track available width
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => setWidth(el.clientWidth));
    obs.observe(el);
    setWidth(el.clientWidth);
    return () => obs.disconnect();
  }, []);

  // Render the current page
  useEffect(() => {
    if (!doc || width === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let task: Cancelable | null = null;

    (async () => {
      const pg = await doc.getPage(page);
      if (cancelled) return;
      const base = pg.getViewport({ scale: 1 });
      const fitW = (width - 2) / base.width;
      const fitH = 560 / base.height;
      const fit = fitMode === 'page' ? Math.min(fitW, fitH) : fitW;
      const cssScale = fit * zoom;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = pg.getViewport({ scale: cssScale * dpr });

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
      canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      task = pg.render({ canvasContext: ctx, viewport, canvas });
      try {
        await task.promise;
      } catch {
        // render cancelled
      }
    })();

    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, page, zoom, fitMode, width]);

  if (loadError) {
    return <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">{loadError}</div>;
  }
  if (!doc) {
    return <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading preview...</div>;
  }

  const total = doc.numPages;
  const btn = 'rounded-md border border-border p-1.5 text-foreground hover:bg-muted disabled:opacity-40';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button className={btn} disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-foreground">
            Page {page} of {total}
          </span>
          <button className={btn} disabled={page >= total} onClick={() => setPage((p) => Math.min(total, p + 1))} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className={btn} disabled={zoom <= 0.5} onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))} aria-label="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
          <button className={btn} disabled={zoom >= 3} onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))} aria-label="Zoom in">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            className={btn}
            onClick={() => {
              setFitMode('width');
              setZoom(1);
            }}
            aria-label="Fit to width"
          >
            <MoveHorizontal className="h-4 w-4" />
          </button>
          <button
            className={btn}
            onClick={() => {
              setFitMode('page');
              setZoom(1);
            }}
            aria-label="Fit to page"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Worksheet: <span className="font-medium text-foreground">{pageSheets[page - 1] ?? ''}</span>
      </p>

      <div ref={wrapRef} className="max-h-[70vh] overflow-auto rounded-xl border border-border bg-muted/30 p-2">
        <canvas ref={canvasRef} className="mx-auto block bg-white shadow-sm" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {Array.from({ length: total }, (_, i) => (
          <Thumb key={i} doc={doc} pageNumber={i + 1} active={page === i + 1} onClick={() => setPage(i + 1)} />
        ))}
      </div>
    </div>
  );
}