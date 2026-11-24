"use client";
import type * as pdfjsLib from "pdfjs-dist";
import type { PlacedElement } from "./sign-pdf-types";
import { SignPdfDocumentPage } from "./sign-pdf-document-page";

interface Props {
  pdfDoc: pdfjsLib.PDFDocumentProxy; pageIndex: number; zoom: number;
  elements: PlacedElement[]; selectedId: string | null;
  onSelect: (id: string | null) => void; onUpdate: (id: string, updates: Partial<PlacedElement>) => void; onDelete: (id: string) => void;
}

export function SignPdfDocumentViewer(props: Props) {
  return (
    <div className="flex-1 overflow-auto rounded-xl border border-border bg-muted/30 p-4 md:p-8">
      <SignPdfDocumentPage {...props} />
    </div>
  );
}