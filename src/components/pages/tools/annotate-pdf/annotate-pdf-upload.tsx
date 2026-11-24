"use client";
// src/components/pages/tools/annotate-pdf/annotate-pdf-upload.tsx
import { useRef, useState } from "react";
import { UploadIcon } from "@/components/general/icons/pdf-icons";
import { MAX_FILE_BYTES } from "./annotate-pdf-constants";
import { bytesToMb } from "./annotate-pdf-utils";

export function AnnotatePdfUpload({
  onFile,
  error,
}: {
  onFile: (f: File) => void;
  error: string | null;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [drag, setDrag] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      alert("Please choose a PDF file.");
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      alert(`File is too large (max ${bytesToMb(MAX_FILE_BYTES)}).`);
      return;
    }
    onFile(f);
  };

  return (
    <div
      className={`mx-auto mt-8 flex max-w-3xl flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors ${
        drag ? "border-primary bg-primary/5" : "border-border bg-card"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
    >
      <UploadIcon className="h-10 w-10 text-primary" />
      <h2 className="mt-4 text-lg font-semibold">Drop your PDF here</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Files stay in your browser. Nothing is uploaded to a server.
      </p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Choose PDF file
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      <p className="mt-6 text-xs text-muted-foreground">Max size {bytesToMb(MAX_FILE_BYTES)}</p>
    </div>
  );
}