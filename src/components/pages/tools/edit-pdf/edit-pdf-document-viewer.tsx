/**
 * PDFBerri – Edit PDF
 * Central scrolling document viewer
 */

"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";
import type { UseEditPdfReturn } from "./use-edit-pdf";
import { EditPdfPageCanvas } from "./edit-pdf-page-canvas";
import { cn } from "@/lib/utils";

interface EditPdfDocumentViewerProps {
  editor: UseEditPdfReturn;
  pdf: PDFDocumentProxy | null;
  className?: string;
}

export function EditPdfDocumentViewer({
  editor,
  pdf,
  className,
}: EditPdfDocumentViewerProps) {
  const { state } = editor;
  const ordered = [...state.pages].sort((a, b) => a.order - b.order);

  // Simple scale based on zoom (fit modes would calculate from container width)
  const scale = state.viewport.zoom;

  return (
    <div
      className={cn(
        "flex-1 overflow-auto bg-muted/30 p-4 md:p-8",
        className
      )}
      role="main"
      aria-label="Document canvas"
    >
      <div className="mx-auto flex flex-col items-center gap-8">
        {ordered.map((page) => (
          <div key={page.id} className="relative">
            <EditPdfPageCanvas
              page={page}
              pdf={pdf}
              editor={editor}
              scale={scale}
            />
            <div className="mt-2 text-center text-xs text-muted-foreground">
              Page {page.order + 1}
            </div>
          </div>
        ))}

        {ordered.length === 0 && (
          <p className="py-20 text-sm text-muted-foreground">
            No pages to display
          </p>
        )}
      </div>
    </div>
  );
}
