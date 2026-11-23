"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MergeFileCard } from "./merge-file-card";
import { MergeFileItem } from "./merge-types";

interface MergeFileListProps {
  files: MergeFileItem[];
  onMove: (from: number, to: number) => void;
  onRemove: (id: string) => void;
}

/**
 * Drag-and-drop reordering uses native HTML5 drag events (mouse and pen).
 * Touch users reorder with the up/down buttons on each card.
 */
export function MergeFileList({ files, onMove, onRemove }: MergeFileListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const reset = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <ol
      aria-label="Files to merge, in merge order"
      className="flex flex-col gap-2"
    >
      {files.map((item, index) => {
        const isDragging = dragIndex === index;
        const showLine =
          dragIndex !== null && overIndex === index && dragIndex !== index;

        return (
          <li
            key={item.id}
            draggable
            onDragStart={(event) => {
              setDragIndex(index);
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", item.id);
            }}
            onDragOver={(event) => {
              if (dragIndex === null) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              if (overIndex !== index) setOverIndex(index);
            }}
            onDrop={(event) => {
              if (dragIndex === null) return;
              event.preventDefault();
              if (dragIndex !== index) onMove(dragIndex, index);
              reset();
            }}
            onDragEnd={reset}
            className={cn(
              "rounded-xl transition-[opacity,box-shadow]",
              isDragging && "opacity-50",
              showLine &&
                dragIndex !== null &&
                (dragIndex < index
                  ? "shadow-[0_3px_0_0_var(--primary)]"
                  : "shadow-[0_-3px_0_0_var(--primary)]"),
            )}
          >
            <MergeFileCard
              item={item}
              index={index}
              total={files.length}
              onRemove={onRemove}
              onMove={onMove}
            />
          </li>
        );
      })}
    </ol>
  );
}