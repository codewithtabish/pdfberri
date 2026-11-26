"use client";

import type { ExtractedImage } from "./extract-types";
import { formatBytes, formatPages } from "./extract-utils";

interface Props {
  image: ExtractedImage;
  isSelected: boolean;
  onToggle: () => void;
  onPreview: () => void;
  onDownload: () => void;
}

export function ExtractImageCard({ image, isSelected, onToggle, onPreview, onDownload }: Props) {
  return (
    <div className={`relative group flex flex-col border rounded-xl overflow-hidden bg-card transition-all ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}>
      <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
        <img 
          src={image.url} 
          alt={image.fileName} 
          className="object-contain w-full h-full cursor-pointer hover:scale-105 transition-transform"
          onClick={onPreview}
        />
        <div className="absolute top-2 left-2">
          <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={onToggle}
            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer shadow-sm"
          />
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onDownload} className="p-1.5 bg-background/90 rounded-md shadow-sm hover:bg-background text-foreground" aria-label="Download image">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          </button>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground truncate" title={image.fileName}>{image.fileName}</p>
        <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span className="uppercase">{image.format}</span>
          <span>•</span>
          <span>{image.width} × {image.height}</span>
          <span>•</span>
          <span>{formatBytes(image.size)}</span>
          <span>•</span>
          <span>{formatPages(image.pages)}</span>
        </div>
      </div>
    </div>
  );
}