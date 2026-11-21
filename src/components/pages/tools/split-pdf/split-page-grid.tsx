"use client";

import { useMemo, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { SPLIT_CONFIG } from "./split-constants";
import { SplitPageThumbnail } from "./split-page-thumbnail";
import { RenderQueue } from "./split-utils";

interface SplitPageGridProps {
  pdf: PDFDocumentProxy;
  pageCount: number;
  selected: ReadonlySet<number>;
  interactive: boolean;
  assignments: ReadonlyMap<number, string>;
  onToggle: (page: number) => void;
}

/** Remount with `key={doc.id}` when the document changes so the queue is fresh. */
export function SplitPageGrid({ pdf, pageCount, selected, interactive, assignments, onToggle }: SplitPageGridProps) {
  const [queue] = useState(() => new RenderQueue(SPLIT_CONFIG.thumbnailConcurrency));
  const pages = useMemo(() => Array.from({ length: pageCount }, (_, i) => i + 1), [pageCount]);

  return (
    <div
      role="group"
      aria-label={interactive ? "Select pages to extract" : "Document pages"}
      className="grid max-h-[34rem] grid-cols-2 gap-3 overflow-y-auto overscroll-contain p-1 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5"
    >
      {pages.map((page) => (
        <SplitPageThumbnail
          key={page}
          pdf={pdf}
          queue={queue}
          pageNumber={page}
          selected={selected.has(page)}
          interactive={interactive}
          badge={assignments.get(page)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
