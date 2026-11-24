// src/components/pages/tools/edit-pdf/edit-pdf-toolbar.tsx
'use client';

import { Undo2, Redo2, ZoomIn, ZoomOut, RotateCw, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EDIT_PDF_CONFIG } from './edit-pdf-constants';
import type { UseEditPdfReturn } from './use-edit-pdf';

export function EditPdfToolbar({ editor }: { editor: UseEditPdfReturn }) {
  const { state } = editor;
  const doc = state.document;
  if (!doc) return null;
  const currentIndex = doc.pages.findIndex((p) => p.id === state.selection.pageId);
  const page = doc.pages[currentIndex] ?? doc.pages[0];

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-2 shadow-sm">
      <Button variant="ghost" size="icon" onClick={editor.undo} disabled={!editor.canUndo} aria-label="Undo">
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={editor.redo} disabled={!editor.canRedo} aria-label="Redo">
        <Redo2 className="h-4 w-4" />
      </Button>

      <span className="mx-2 text-sm text-muted-foreground">
        Page {currentIndex + 1} of {doc.pages.length}
      </span>

      <Button variant="ghost" size="icon" onClick={() => editor.setZoom(state.viewport.zoom - EDIT_PDF_CONFIG.zoomStep)} aria-label="Zoom out">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <span className="w-12 text-center text-sm">{Math.round(state.viewport.zoom * 100)}%</span>
      <Button variant="ghost" size="icon" onClick={() => editor.setZoom(state.viewport.zoom + EDIT_PDF_CONFIG.zoomStep)} aria-label="Zoom in">
        <ZoomIn className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="icon" onClick={() => editor.rotatePage(page.id)} aria-label="Rotate page">
        <RotateCw className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost" size="icon"
        onClick={() => editor.deletePage(page.id)}
        disabled={doc.pages.length <= 1}
        aria-label="Delete page"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <div className="ml-auto">
        <Button
          onClick={editor.exportDocument}
          disabled={state.export.status === 'exporting'}
        >
          <Download className="mr-2 h-4 w-4" />
          {state.export.status === 'exporting' ? 'Exporting…' : 'Download PDF'}
        </Button>
      </div>
    </div>
  );
}