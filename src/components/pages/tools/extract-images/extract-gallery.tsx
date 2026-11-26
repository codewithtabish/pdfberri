"use client";

import { useState } from "react";
import type { ExtractedImage } from "./extract-types";
import { ExtractImageCard } from "./extract-image-card";
import { ExtractImagePreview } from "./extract-image-preview";
import { generateImagesZip } from "./extract-zip";

interface Props {
  images: ExtractedImage[];
  originalFileName: string;
  onReset: () => void;
}

export function ExtractGallery({ images, originalFileName, onReset }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewImage, setPreviewImage] = useState<ExtractedImage | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => setSelectedIds(new Set(images.map(i => i.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const downloadSingle = (img: ExtractedImage) => {
    const a = document.createElement("a");
    a.href = img.url;
    a.download = img.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadZip = async (imgsToZip: ExtractedImage[]) => {
    if (imgsToZip.length === 0) return;
    setIsZipping(true);
    try {
      const zipBlob = await generateImagesZip(imgsToZip);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${originalFileName.replace(/\.pdf$/i, "")}_images.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Failed to create ZIP file.");
    } finally {
      setIsZipping(false);
    }
  };

  const selectedImages = images.filter(i => selectedIds.has(i.id));

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-border bg-card rounded-xl">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground">
            <strong className="text-primary">{images.length}</strong> Images Found
          </span>
          <span className="text-sm text-muted-foreground">|</span>
          <span className="text-sm font-medium text-foreground">
            <strong className="text-primary">{selectedIds.size}</strong> Selected
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={selectAll} className="px-3 py-1.5 text-sm font-medium border border-border rounded-md hover:bg-muted">Select All</button>
          <button onClick={clearSelection} className="px-3 py-1.5 text-sm font-medium border border-border rounded-md hover:bg-muted">Clear</button>
          
          <div className="h-6 w-px bg-border mx-1"></div>
          
          <button 
            onClick={() => downloadZip(selectedImages)} 
            disabled={selectedIds.size === 0 || isZipping}
            className="px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {isZipping ? "Zipping..." : "Download Selected"}
          </button>
          <button 
            onClick={() => downloadZip(images)} 
            disabled={images.length === 0 || isZipping}
            className="px-3 py-1.5 text-sm font-medium border border-primary text-primary rounded-md hover:bg-primary/5 disabled:opacity-50 flex items-center gap-2"
          >
            Download All
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img) => (
          <ExtractImageCard
            key={img.id}
            image={img}
            isSelected={selectedIds.has(img.id)}
            onToggle={() => toggleSelection(img.id)}
            onPreview={() => setPreviewImage(img)}
            onDownload={() => downloadSingle(img)}
          />
        ))}
      </div>

      {previewImage && (
        <ExtractImagePreview 
          image={previewImage} 
          onClose={() => setPreviewImage(null)} 
          onDownload={() => downloadSingle(previewImage)} 
        />
      )}
    </div>
  );
}