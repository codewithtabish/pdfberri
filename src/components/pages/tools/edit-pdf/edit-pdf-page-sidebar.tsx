// src/components/pages/tools/edit-pdf/edit-pdf-page-sidebar.tsx
'use client';

import { useEffect, useRef } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { PDFPageState } from './edit-pdf-types';
import type { UseEditPdfReturn } from './use-edit-pdf';
import { EDIT_PDF_CONFIG } from './edit-pdf-constants';

export function EditPdfPageSidebar({ editor }: { editor: UseEditPdfReturn }) {
  const pages = editor.state.document?.pages ?? [];
  const current = editor.state.selection.pageId;

  return (
    <aside className="hidden w-32 shrink-0 overflow-y-auto rounded-xl border bg-card p-2 md:block" aria-label="Pages">
      {pages.map((p, i) => (
        <button
          key={p.id}
          onClick={() => editor.setPage(p.id)}
          aria-current={p.id === current ? 'page' : undefined}
          className={`mb-2 flex w-full flex-col items-center rounded-md border p-1 text-xs ${
            p.id === current ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
        >
          <PageThumb pdfDoc={editor.pdfDoc} page={p} />
          <span className="mt-1 text-muted-foreground">{i + 1}</span>
        </button>
      ))}
    </aside>
  );
}

function PageThumb({ pdfDoc, page }: { pdfDoc: PDFDocumentProxy | null; page: PDFPageState }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!pdfDoc || !ref.current) return;
      try {
        const p = await pdfDoc.getPage(page.originalIndex + 1);
        const vp1 = p.getViewport({ scale: 1 });
        
        // Use THUMBNAIL_WIDTH from your constants
        const thumbWidth = EDIT_PDF_CONFIG.THUMBNAIL_WIDTH || 120;
        const scale = thumbWidth / vp1.width;
        
        const vp = p.getViewport({ scale });
        const c = ref.current;
        c.width = vp.width; 
        c.height = vp.height;
        
        const ctx = c.getContext('2d');
        if (!ctx) return;

        // FIXED: Added `canvas: c` to satisfy pdfjs-dist v4 types
        await p.render({ 
          canvasContext: ctx, 
          canvas: c, 
          viewport: vp 
        }).promise;
        
      } catch { /* ignore render errors for thumbnails */ }
    })();
    return () => { cancelled = true; };
  }, [pdfDoc, page.originalIndex]);

  return <canvas ref={ref} className="block max-w-full" />;
}