"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/utils";
import { SPLIT_CONFIG, SPLIT_UI } from "./split-constants";
import { formatBytes } from "./split-utils";
import { AlertCircleIcon, LoaderIcon, PdfFileIcon, UploadIcon } from "@/components/general/icons/pdf-icons";

interface SplitUploadZoneProps {
  loading: boolean;
  error: string | null;
  onFile: (file: File) => void;
}

export function SplitUploadZone({ loading, error, onFile }: SplitUploadZoneProps) {
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
    <div className={cn(SPLIT_UI.card, "p-3 sm:p-4")}>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-4 py-14 text-center transition-colors sm:py-20",
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
            {loading ? "Reading your PDF…" : "Drop your PDF here"}
          </p>
          <p id={hintId} className="text-sm text-muted-foreground">
            One PDF, up to {formatBytes(SPLIT_CONFIG.maxFileSizeBytes)} and {SPLIT_CONFIG.maxPages.toLocaleString()} pages.
          </p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className={SPLIT_UI.primaryButton}
          aria-describedby={hintId}
        >
          <UploadIcon className="size-5" />
          Browse PDF
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="sr-only"
          tabIndex={-1}
          aria-label="Choose a PDF file to split"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {error ? (
        <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
