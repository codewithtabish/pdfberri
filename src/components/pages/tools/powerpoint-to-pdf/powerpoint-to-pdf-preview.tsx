"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { ChevronLeft, ChevronRight } from "lucide-react";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
}

interface Props {
  pdfBlob: Blob;
}

export function PowerPointToPdfPreview({ pdfBlob }: Props) {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadPdf() {
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      if (!cancelled) {
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setCurrentPage(1);
      }
    }
    loadPdf();
    return () => { cancelled = true; };
  }, [pdfBlob]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let renderTask: any = null;
    let cancelled = false;

    async function renderPage() {
      const page = await pdfDoc!.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d");
      if (!ctx || cancelled) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      renderTask = page.render({ canvasContext: ctx, viewport, canvas });
      await renderTask.promise;
    }

    renderPage();
    return () => { 
      cancelled = true; 
      renderTask?.cancel(); 
    };
  }, [pdfDoc, currentPage]);

  if (!pdfDoc) {
    return <div className="flex items-center justify-center h-64 bg-muted rounded-xl border border-border">Loading preview...</div>;
  }

  return (
    <div className="flex flex-col border border-border rounded-xl bg-card overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50">
        <span className="text-sm font-medium">PDF Preview</span>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded hover:bg-background disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium min-w-[3rem] text-center">
            {currentPage} / {numPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
            disabled={currentPage === numPages}
            className="p-1 rounded hover:bg-background disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-muted/20 flex justify-center p-4 min-h-[300px]">
        <canvas ref={canvasRef} className="shadow-md max-w-full h-auto object-contain" />
      </div>
    </div>
  );
}