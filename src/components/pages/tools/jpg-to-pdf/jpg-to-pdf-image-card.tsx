"use client";

import { memo, type DragEvent } from "react";
import {
  ChevronRightIcon,
  RotateCwIcon,
  XIcon,
} from "@/components/general/icons/pdf-icons";
import type { ImageItem } from "./jpg-to-pdf-types";
import { formatBytes } from "./jpg-to-pdf-utils";

interface JpgToPdfImageCardProps {
  image: ImageItem;
  position: number;
  total: number;
  disabled: boolean;
  isDragTarget: boolean;
  onRemove: (id: string) => void;
  onRotate: (id: string) => void;
  onMove: (id: string, offset: -1 | 1) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragEnter: (id: string) => void;
  onDrop: (id: string) => void;
  isDragging: boolean;
}

const iconButton =
  "flex size-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none";

function JpgToPdfImageCardBase({
  image,
  position,
  total,
  disabled,
  isDragTarget,
  isDragging,
  onRemove,
  onRotate,
  onMove,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDrop,
}: JpgToPdfImageCardProps) {
  const handleDragStart = (event: DragEvent<HTMLLIElement>) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", image.id);
    onDragStart(image.id);
  };

  return (
    <li
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onDragEnter={() => onDragEnter(image.id)}
      onDragOver={(event) => {
        if (isDragging || isDragTarget) event.preventDefault();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop(image.id);
      }}
      className={`group relative flex flex-col gap-2 rounded-2xl border bg-card p-2 shadow-sm transition-shadow motion-reduce:transition-none ${
        isDragTarget ? "border-primary ring-2 ring-primary/40" : "border-border"
      } ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, cannot be optimized by next/image */}
        <img
          src={image.previewUrl}
          alt={`Preview of ${image.name}`}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="size-full object-contain transition-transform duration-200 motion-reduce:transition-none"
          style={{ transform: `rotate(${image.rotation}deg)` }}
        />
        <span
          className="absolute left-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
          aria-hidden="true"
        >
          {position}
        </span>
        <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100 motion-reduce:transition-none">
          <button
            type="button"
            className={iconButton}
            onClick={() => onRotate(image.id)}
            disabled={disabled}
            aria-label={`Rotate ${image.name} 90 degrees clockwise`}
          >
            <RotateCwIcon className="size-3.5" />
          </button>
          <button
            type="button"
            className={iconButton}
            onClick={() => onRemove(image.id)}
            disabled={disabled}
            aria-label={`Remove ${image.name}`}
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="min-w-0 px-1">
        <p className="truncate text-sm font-semibold text-foreground" title={image.name}>
          {image.name}
        </p>
        <p className="truncate font-mono text-xs text-muted-foreground">
          {image.displayWidth}×{image.displayHeight} · {formatBytes(image.size)}
        </p>
      </div>

      <div className="flex items-center justify-between px-1 pb-0.5">
        <button
          type="button"
          className={iconButton}
          onClick={() => onMove(image.id, -1)}
          disabled={disabled || position === 1}
          aria-label={`Move ${image.name} earlier, currently position ${position} of ${total}`}
        >
          <ChevronRightIcon className="size-3.5 rotate-180" />
        </button>
        <span className="text-xs text-muted-foreground">
          Page {position}
        </span>
        <button
          type="button"
          className={iconButton}
          onClick={() => onMove(image.id, 1)}
          disabled={disabled || position === total}
          aria-label={`Move ${image.name} later, currently position ${position} of ${total}`}
        >
          <ChevronRightIcon className="size-3.5" />
        </button>
      </div>
    </li>
  );
}

export const JpgToPdfImageCard = memo(JpgToPdfImageCardBase);
