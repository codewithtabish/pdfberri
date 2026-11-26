"use client";

import { useCallback, useState } from "react";

interface Props {
  onFile: (file: File) => void;
}

export function OcrUpload({ onFile }: Props) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please provide a valid PDF file.");
      return;
    }
    if (file.size === 0) {
      setError("The file is empty.");
      return;
    }
    setError(null);
    onFile(file);
  }, [onFile]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className={`flex w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 transition-colors ${
          dragging ? "border-primary bg-primary/5" : "border-border bg-card"
        }`}
      >
        <div className="rounded-full bg-primary/10 p-4 text-primary">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">Upload your scanned PDF</h3>
          <p className="mt-1 text-sm text-muted-foreground">Drop your PDF here or browse files</p>
        </div>
        <input
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          id="ocr-upload"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <label
          htmlFor="ocr-upload"
          className="cursor-pointer rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Select PDF file
        </label>
      </div>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}