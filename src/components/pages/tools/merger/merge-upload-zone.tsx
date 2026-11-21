"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { MERGE_LIMITS } from "./merge-constants";

interface MergeUploadZoneProps {
  compact?: boolean;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
}

function isFileDrag(event: DragEvent<HTMLElement>): boolean {
  return Array.from(event.dataTransfer.types).includes("Files");
}

export function MergeUploadZone({
  compact = false,
  disabled = false,
  onFiles,
}: MergeUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const openPicker = () => inputRef.current?.click();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = ""; // allow picking the same file again
    if (picked.length > 0) onFiles(picked);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const dropped = Array.from(event.dataTransfer.files);
    if (dropped.length > 0) onFiles(dropped);
  };

  const dropProps = {
    onDragOver: handleDragOver,
    onDragEnter: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  };

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept="application/pdf,.pdf"
      multiple
      hidden
      aria-label="Choose PDF files"
      onChange={handleChange}
    />
  );

  if (compact) {
    return (
      <div
        {...dropProps}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm transition-colors sm:flex-row sm:gap-4",
          isDragOver
            ? "border-primary bg-primary/10"
            : "border-primary/40 bg-primary/5",
        )}
      >
        {input}
        <span className="inline-flex items-center gap-2 font-semibold text-foreground">
          <Upload aria-hidden="true" className="size-5 text-primary" />
          Drop more PDFs here or
        </span>
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled}
          className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
        >
          Add files
        </button>
        <span className="text-xs text-foreground/65">
          PDF files only. Up to {MERGE_LIMITS.maxFiles} files.
        </span>
      </div>
    );
  }

  return (
    <div
      {...dropProps}
      className={cn(
        "flex flex-col items-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors sm:py-16",
        isDragOver
          ? "border-primary bg-primary/10"
          : "border-primary/40 bg-primary/5",
      )}
    >
      {input}
      <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Upload aria-hidden="true" className="size-8" />
      </span>
      <h2 className="mt-5 text-xl font-bold tracking-tight text-foreground">
        Select PDF files
      </h2>
      <p className="mt-2 max-w-md text-sm text-foreground/65">
        Drag and drop your PDFs here or browse files from your device.
      </p>
      <button
        type="button"
        onClick={openPicker}
        disabled={disabled}
        className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-[transform,opacity] hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
      >
        <Upload aria-hidden="true" className="size-4" />
        Choose PDF Files
      </button>
      <p className="mt-3 text-xs text-foreground/65">
        Select two or more PDF documents. Up to {MERGE_LIMITS.maxFiles} files.
      </p>
    </div>
  );
}