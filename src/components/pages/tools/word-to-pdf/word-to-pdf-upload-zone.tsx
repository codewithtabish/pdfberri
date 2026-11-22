// src/components/pages/tools/word-to-pdf/word-to-pdf-upload-zone.tsx
"use client";

import { useRef, useState, type DragEvent } from "react";

import { UploadIcon, LoaderIcon, ProtectIcon } from "@/components/general/icons/pdf-icons";

import { WordButton } from "./word-to-pdf-button";
import { joinClasses } from "./word-to-pdf-utils";

interface WordUploadZoneProps {
  onBrowse: () => void;
  onFilesDropped: (files: File[]) => void;
  legacyDocEnabled: boolean;
  maxFileLabel: string;
  isChecking: boolean;
}

export function WordUploadZone({
  onBrowse,
  onFilesDropped,
  legacyDocEnabled,
  maxFileLabel,
  isChecking,
}: WordUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const depth = useRef(0);

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    depth.current += 1;
    setIsDragging(true);
  };
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };
  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setIsDragging(false);
  };
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    depth.current = 0;
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) onFilesDropped(files);
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={joinClasses(
        "flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed px-4 py-10 text-center transition-colors motion-reduce:transition-none sm:py-14",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-primary/40 bg-muted/30",
      )}
    >
      <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {isChecking ? (
          <LoaderIcon className="size-8 animate-spin motion-reduce:animate-none" />
        ) : (
          <UploadIcon className="size-8" />
        )}
      </span>

      <div className="space-y-1">
        <p className="text-xl font-bold tracking-tight sm:text-2xl">
          {isDragging ? "Drop it here" : "Drop your Word document here"}
        </p>
        <p className="text-sm text-muted-foreground">
          {legacyDocEnabled
            ? "Convert your DOCX or DOC document into a PDF."
            : "Convert your DOCX document into a PDF."}
        </p>
      </div>

      <WordButton
        variant="primary"
        size="lg"
        onClick={onBrowse}
        disabled={isChecking}
        aria-describedby="word-upload-hint"
      >
        Choose Word Document
      </WordButton>

      <p
        id="word-upload-hint"
        className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground"
      >
        <span className="font-mono">
          {legacyDocEnabled ? "DOCX, DOC" : "DOCX"} · up to {maxFileLabel}
        </span>
        <span className="inline-flex items-center gap-1">
          <ProtectIcon className="size-3.5" />
          DOCX files stay in your browser
        </span>
      </p>
    </div>
  );
}
