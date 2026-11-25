"use client";

import { useCallback, useRef } from "react";
import { UploadIcon, LockIcon } from "@/components/general/icons/pdf-icons";

interface UnlockPdfUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function UnlockPdfUpload({ onFileSelect, disabled }: UnlockPdfUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect, disabled]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [onFileSelect]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="rounded-2xl border-2 border-dashed border-border bg-muted/20 p-8 sm:p-12 transition-colors hover:bg-muted/40"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <UploadIcon className="h-8 w-8 text-primary" />
        </div>
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            Select PDF file
          </button>
          <p className="mt-3 text-sm text-muted-foreground">or drag and drop your PDF here</p>
        </div>
        <p className="text-xs text-muted-foreground">PDF only</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <LockIcon className="h-3.5 w-3.5" />
          <span>Your documents stay private.</span>
        </div>
      </div>
    </div>
  );
}