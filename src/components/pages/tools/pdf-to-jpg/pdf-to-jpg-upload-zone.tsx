"use client";

import { useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/utils";
import { AlertCircleIcon, LoaderIcon, PdfFileIcon, UploadIcon } from "@/components/general/icons/pdf-icons";

interface UploadZoneProps {
  loading: boolean;
  error: string | null;
  onFile: (file: File) => void;
}

export function PdfToJpgUploadZone({ loading, error, onFile }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.[0]) onFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-4 py-16 text-center transition-colors",
          dragging ? "border-primary bg-primary/10" : "border-primary/30 bg-primary/5"
        )}
      >
        <span className="flex size-16 items-center justify-center rounded-2xl bg-card text-primary shadow-sm ring-1 ring-border">
          {loading ? <LoaderIcon className="size-8 animate-spin" /> : <PdfFileIcon className="size-8" />}
        </span>
        <div>
          <p className="text-lg font-bold text-foreground">{loading ? "Loading PDF…" : "Select your file to convert"}</p>
          <p className="text-sm text-muted-foreground">or drag and drop it here.</p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <UploadIcon className="size-5" /> Select File
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.[0]) onFile(e.target.files[0]);
            e.target.value = "";
          }}
        />
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
          Your files are secure and private.
        </p>
      </div>
      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircleIcon className="size-5 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}