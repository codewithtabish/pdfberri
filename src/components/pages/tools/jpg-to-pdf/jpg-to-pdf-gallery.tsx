"use client";

import { useCallback, useState } from "react";
import { PlusIcon, TrashIcon } from "@/components/general/icons/pdf-icons";
import { JpgToPdfImageCard } from "./jpg-to-pdf-image-card";
import type { ImageItem } from "./jpg-to-pdf-types";
import { formatBytes, plural } from "./jpg-to-pdf-utils";

interface JpgToPdfGalleryProps {
  images: readonly ImageItem[];
  disabled: boolean;
  onAddMore: () => void;
  onClear: () => void;
  onRemove: (id: string) => void;
  onRotate: (id: string) => void;
  onMove: (id: string, offset: -1 | 1) => void;
  onReorder: (fromId: string, toId: string) => void;
}

export function JpgToPdfGallery({
  images,
  disabled,
  onAddMore,
  onClear,
  onRemove,
  onRotate,
  onMove,
  onReorder,
}: JpgToPdfGalleryProps) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const endDrag = useCallback(() => {
    setDragId(null);
    setOverId(null);
  }, []);

  const handleDrop = useCallback(
    (toId: string) => {
      if (dragId) onReorder(dragId, toId);
      endDrag();
    },
    [dragId, onReorder, endDrag],
  );

  const totalBytes = images.reduce((sum, image) => sum + image.size, 0);

  return (
    <section aria-labelledby="jpg-to-pdf-gallery-heading" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="jpg-to-pdf-gallery-heading" className="text-base font-bold text-foreground">
            {images.length} {plural(images.length, "image")} · {formatBytes(totalBytes)}
          </h2>
          <p className="text-sm text-muted-foreground">
            Pages follow this order. Drag to reorder, or use the arrow buttons.
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
        >
          <TrashIcon className="size-4" />
          Remove all
        </button>
      </div>

      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {images.map((image, index) => (
          <JpgToPdfImageCard
            key={image.id}
            image={image}
            position={index + 1}
            total={images.length}
            disabled={disabled}
            isDragging={dragId === image.id}
            isDragTarget={dragId !== null && overId === image.id && dragId !== image.id}
            onRemove={onRemove}
            onRotate={onRotate}
            onMove={onMove}
            onDragStart={setDragId}
            onDragEnd={endDrag}
            onDragEnter={setOverId}
            onDrop={handleDrop}
          />
        ))}
        <li className="flex">
          <button
            type="button"
            onClick={onAddMore}
            disabled={disabled}
            className="flex min-h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 text-sm font-semibold text-foreground transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <PlusIcon className="size-5" />
            </span>
            Add more
          </button>
        </li>
      </ol>
    </section>
  );
}
