"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";
<<<<<<< HEAD
import { PageState } from "./rotate-types";
=======
import type { PageState } from "./rotate-types";
>>>>>>> feature/protect-pdf
import { RotatePageThumbnail } from "./rotate-page-thumbnail";

interface RotatePageGridProps {
  pdf: PDFDocumentProxy;
  pages: PageState[];
  selected: ReadonlySet<number>;
  interactive: boolean;
  onToggle: (index: number) => void;
}

export function RotatePageGrid({ pdf, pages, selected, interactive, onToggle }: RotatePageGridProps) {
  return (
    <div
      role="group"
<<<<<<< HEAD
      aria-label="PDF pages "
=======
      aria-label="PDF pages"
>>>>>>> feature/protect-pdf
      className="grid max-h-[40rem] grid-cols-2 gap-4 overflow-y-auto overscroll-contain p-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    >
      {pages.map((page, i) => (
        <RotatePageThumbnail
          key={i}
          pdf={pdf}
          pageIndex={i}
          currentRotation={page.currentRotation}
          selected={selected.has(i)}
          interactive={interactive}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}