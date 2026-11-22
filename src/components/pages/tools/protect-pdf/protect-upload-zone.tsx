"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { motion } from "framer-motion";
import {
  InfoIcon,
  LoaderIcon,
  LockIcon,
  PdfFileIcon,
  UploadIcon,
} from "@/components/general/icons/pdf-icons";
import { cn } from "@/lib/utils";
import { ProtectButton } from "./protect-button";
import { PROTECT_LIMITS } from "./protect-config";
import type { ProtectPdfStatus } from "./protect-types";
import { formatFileSize } from "./protect-utils";

interface ProtectUploadZoneProps {
  status: ProtectPdfStatus;
  hasDocument: boolean;
  disabled: boolean;
  onSelect: (files: File[]) => void;
}

export function ProtectUploadZone({ status, hasDocument, disabled, onSelect }: ProtectUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isChecking = status === "validating" || status === "loading-engine";

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length > 0) onSelect(files);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) onSelect(files);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false);
  };

  return (
    <motion.div
      animate={{ scale: isDragging ? 1.01 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="h-full"
    >
      <div
        role="group"
        aria-label="PDF upload area"
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex h-full min-h-[20rem] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-6 text-center transition-colors duration-200 motion-reduce:transition-none sm:p-8",
          isDragging ? "border-primary bg-primary/10" : "border-primary/35 bg-primary/3",
          disabled && !isChecking && "opacity-70"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={handleChange}
        />

        {isChecking ? (
          <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
            <LoaderIcon className="size-10 animate-spin text-primary motion-reduce:animate-none" />
            <p className="text-base font-semibold text-foreground">Checking your PDF…</p>
            <p className="max-w-xs text-sm text-muted-foreground">Reading the document locally in your browser.</p>
          </div>
        ) : (
          <>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative flex size-20 items-center justify-center rounded-2xl bg-card text-destructive shadow-md ring-1 ring-border"
            >
              <PdfFileIcon className="size-10" />
              <span className="absolute -right-2 -bottom-2 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                <UploadIcon className="size-4" />
              </span>
            </motion.div>

            <div className="flex max-w-xs flex-col gap-1.5">
              <p className="text-xl font-extrabold tracking-tight text-foreground">
                {hasDocument ? "Replace your PDF" : "Secure your PDF document."}
              </p>
              <p className="text-sm text-muted-foreground">
                {hasDocument
                  ? "Drop a different PDF here or choose another file."
                  : "Select a PDF to add password protection."}
              </p>
            </div>

            <ProtectButton
              size="lg"
              variant={hasDocument ? "outline" : "primary"}
              onClick={openPicker}
              disabled={disabled}
              className="w-full max-w-3xs"
            >
              <UploadIcon className="size-5" />
              {hasDocument ? "Choose another PDF" : "Select PDF"}
            </ProtectButton>

            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <InfoIcon className="size-3.5" />
              PDF files only · up to {formatFileSize(PROTECT_LIMITS.maxFileSizeBytes)}
            </p>
          </>
        )}

        <p className="mt-auto flex items-center gap-1.5 pt-2 text-xs font-medium text-muted-foreground">
          <LockIcon className="size-3.5 text-primary" />
          Your files are processed privately in your browser.
        </p>
      </div>
    </motion.div>
  );
}