"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/utils";
import { COMPRESS_CONFIG } from "./compress-config";
import { formatBytes } from "./compress-utils";
import { AlertCircleIcon, LoaderIcon, PdfFileIcon, UploadIcon } from "@/components/general/icons/pdf-icons";

interface CompressUploadZoneProps {
  loading: boolean;
  error: string | null;
  onFile: (file: File) => void;
}

export function CompressUploadZone({ loading, error, onFile }: CompressUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hintId = useId();
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onFile(file);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!loading) handleFiles(event.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-4 py-14 text-center transition-colors sm:py-20",
          dragging ? "border-primary bg-primary/10" : "border-primary/30 bg-primary/5",
        )}
      >
        <span className="flex size-16 items-center justify-center rounded-2xl bg-card text-primary shadow-sm ring-1 ring-border">
          {loading ? (
            <LoaderIcon className="size-8 animate-spin motion-reduce:animate-none" />
          ) : (
            <PdfFileIcon className="size-8" />
          )}
        </span>
        <div className="space-y-1">
          <p className="text-lg font-bold text-foreground">
            {loading ? "Reading your PDF…" : "Choose a PDF"}
          </p>
          <p id={hintId} className="text-sm text-muted-foreground">
            or drag and drop your file here · Up to {formatBytes(COMPRESS_CONFIG.maxFileSizeBytes)}
          </p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-describedby={hintId}
        >
          <UploadIcon className="size-5" />
          Choose PDF
        </button>
        <p className="text-xs text-muted-foreground">Supported format: PDF</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="sr-only"
          tabIndex={-1}
          aria-label="Choose a PDF file to compress"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {error ? (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}