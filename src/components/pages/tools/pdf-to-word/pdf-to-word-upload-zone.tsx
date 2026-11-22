// src/components/pages/tools/pdf-to-word/pdf-to-word-upload-zone.tsx
"use client";

import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  FolderOpenIcon,
  PdfFileIcon,
  UploadIcon,
} from "@/components/general/icons/pdf-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PDF_TO_WORD_LIMITS } from "./pdf-to-word-constants";
import { PdfToWordPrivacyNote } from "./pdf-to-word-privacy-note";
import { formatBytes } from "./pdf-to-word-utils";

interface Props {
  onSelect: (file: File) => void;
  disabled?: boolean;
}

export function PdfToWordUploadZone({ onSelect, disabled = false }: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file) onSelect(file);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onSelect(file);
    event.target.value = "";
  };

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex h-full min-h-72 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
        dragging ? "border-primary bg-primary/5" : "border-primary/40",
        disabled && "opacity-60",
      )}
    >
      <div className="relative">
        <PdfFileIcon className="size-16 text-primary" />
        <span className="absolute -bottom-1 -right-2 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <UploadIcon className="size-4" />
        </span>
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold">Select your PDF file</h3>
        <p className="text-sm text-muted-foreground">
          Drag and drop your document here, or browse your device.
        </p>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={handleChange}
        disabled={disabled}
        aria-label="Choose a PDF file"
      />
      <Button
        type="button"
        size="lg"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="min-w-48 font-semibold"
      >
        <FolderOpenIcon className="size-5" />
        Choose PDF
      </Button>

      <p className="text-sm text-muted-foreground">
        Supported format: PDF · up to{" "}
        {formatBytes(PDF_TO_WORD_LIMITS.maxFileSizeBytes)}
      </p>
      <PdfToWordPrivacyNote>
        Your files are processed privately in your browser.
      </PdfToWordPrivacyNote>
    </div>
  );
}