"use client";

import { useState, type DragEvent } from "react";
import { FolderOpenIcon, LoaderIcon, LockIcon, UploadIcon } from "@/components/general/icons/pdf-icons";
import { LIMITS } from "./jpg-to-pdf-config";
import { formatBytes } from "./jpg-to-pdf-utils";

interface JpgToPdfUploadZoneProps {
  onFiles: (files: FileList) => void;
  onOpenPicker: () => void;
  disabled: boolean;
  isReading: boolean;
  /** "hero" = large empty state, "compact" = slim bar shown above the gallery. */
  variant: "hero" | "compact";
}

function hasFiles(event: DragEvent): boolean {
  return Array.from(event.dataTransfer.types).includes("Files");
}

export function JpgToPdfUploadZone({
  onFiles,
  onOpenPicker,
  disabled,
  isReading,
  variant,
}: JpgToPdfUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const isHero = variant === "hero";

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
    setIsDragging(false);
    if (!disabled && event.dataTransfer.files.length > 0) onFiles(event.dataTransfer.files);
  };

  const dropHandlers = {
    onDragEnter: (event: DragEvent<HTMLDivElement>) => {
      if (hasFiles(event)) {
        event.preventDefault();
        setIsDragging(true);
      }
    },
    onDragOver: (event: DragEvent<HTMLDivElement>) => {
      if (hasFiles(event)) event.preventDefault();
    },
    onDragLeave: (event: DragEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false);
    },
    onDrop: handleDrop,
  };

  const tone = isDragging || isReading ? "border-primary bg-primary/10" : "border-primary/30 bg-primary/5";

  const icon = isReading ? (
    <LoaderIcon className={`${isHero ? "size-10" : "size-8"} animate-spin motion-reduce:animate-none`} />
  ) : (
    <UploadIcon className={isHero ? "size-10" : "size-8"} />
  );

  const status = (
    <p role="status" aria-live="polite" className="sr-only">
      {isReading ? "Reading images" : ""}
    </p>
  );

  if (isHero) {
    return (
      <div
        {...dropHandlers}
        aria-busy={isReading}
        className={`flex min-h-[340px] flex-col items-center justify-center gap-6 rounded-2xl border-2 border-dashed p-6 text-center transition-colors sm:min-h-[400px] sm:p-10 motion-reduce:transition-none ${tone}`}
      >
        <span className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </span>

        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {isReading
              ? "Reading your images…"
              : isDragging
                ? "Drop your images here"
                : "Select your images to convert"}
          </h2>
          <p className="max-w-md text-base text-muted-foreground">
            {isReading
              ? "Checking your files and preparing previews."
              : "Drag and drop JPG, JPEG or PNG files here, or choose them from your device."}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenPicker}
          disabled={disabled}
          className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
        >
          <FolderOpenIcon className="size-5" />
          Select images
        </button>

        <ul className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
          <li className="rounded-full border border-border bg-card px-3 py-1">JPG · JPEG · PNG</li>
          <li className="rounded-full border border-border bg-card px-3 py-1">
            Up to {LIMITS.maxImages} images
          </li>
          <li className="rounded-full border border-border bg-card px-3 py-1">
            {formatBytes(LIMITS.maxFileBytes)} each
          </li>
        </ul>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <LockIcon className="size-4 shrink-0" />
          Your files stay on your device.
        </p>
        {status}
      </div>
    );
  }

  return (
    <div
      {...dropHandlers}
      aria-busy={isReading}
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-5 text-center transition-colors sm:flex-row sm:gap-5 sm:text-left motion-reduce:transition-none ${tone}`}
    >
      <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col items-center gap-1 sm:items-start">
        <p className="text-base font-bold text-foreground">
          {isReading ? "Reading your images…" : isDragging ? "Drop your images here" : "Add more images"}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <LockIcon className="size-4 shrink-0" />
          JPG, JPEG and PNG. Files stay on your device.
        </p>
      </div>
      <button
        type="button"
        onClick={onOpenPicker}
        disabled={disabled}
        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
      >
        <FolderOpenIcon className="size-5" />
        Select images
      </button>
      {status}
    </div>
  );
}