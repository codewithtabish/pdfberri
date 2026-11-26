"use client";

import { useEffect } from "react";
import type { ExtractedImage } from "./extract-types";
import { formatBytes, formatPages } from "./extract-utils";

interface Props {
  image: ExtractedImage;
  onClose: () => void;
  onDownload: () => void;
}

export function ExtractImagePreview({ image, onClose, onDownload }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={image.fileName}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col max-w-4xl w-full max-h-[90vh] bg-background rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground truncate">{image.fileName}</h3>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-muted rounded-md" aria-label="Close preview">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center p-4 min-h-[300px]">
          <img src={image.url} alt={image.fileName} className="max-w-full max-h-full object-contain shadow-sm" />
        </div>

        <div className="p-4 border-t border-border flex flex-wrap items-center justify-between gap-4 bg-card">
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <div className="flex gap-4">
              <span>Format: <strong className="text-foreground uppercase">{image.format}</strong></span>
              <span>Dimensions: <strong className="text-foreground">{image.width} × {image.height}</strong></span>
            </div>
            <div className="flex gap-4">
              <span>Size: <strong className="text-foreground">{formatBytes(image.size)}</strong></span>
              <span>Source: <strong className="text-foreground">{formatPages(image.pages)}</strong></span>
            </div>
          </div>
          <button onClick={onDownload} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Download Image
          </button>
        </div>
      </div>
    </div>
  );
}