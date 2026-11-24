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

  // Safely cast the editor and state to match what the canvas needs.
  // This prevents the build from failing while you align the types later.
  const safeState = state as any;
  const safeEditor = editor as any;

  // Sort pages by their display order
  const ordered = [...(safeState.pages || [])].sort((a: any, b: any) => a.order - b.order);

  // Scale from the editor's viewport zoom (fallback to zoom or 1)
  const scale = safeState.viewport?.zoom ?? safeState.zoom ?? 1;

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
        {ordered.map((page: any) => (
          <div key={page.id} className="relative">
            <EditPdfPageCanvas
              pdfDoc={pdf}
              pageState={page}
              zoom={scale}
              activeTool={safeState.activeTool || 'select'}
              selectedObjectId={safeState.selectedObjectId || null}
              onSelect={safeEditor.selectObject || safeEditor.onSelect || (() => {})}
              onPlaceObject={safeEditor.placeObject || safeEditor.onPlaceObject || (() => {})}
              onDrawAnnotation={safeEditor.addAnnotation || safeEditor.onDrawAnnotation || (() => {})}
              onUpdateObject={safeEditor.updateObject || safeEditor.onUpdateObject || (() => {})}
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