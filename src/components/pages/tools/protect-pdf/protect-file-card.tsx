"use client";

import { useRef, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import { PdfFileIcon, RefreshIcon, TrashIcon } from "@/components/general/icons/pdf-icons";
import { ProtectButton } from "./protect-button";
import type { ProtectPdfDocument } from "./protect-types";
import { formatFileSize, formatPageCount } from "./protect-utils";

interface ProtectFileCardProps {
  document: ProtectPdfDocument;
  disabled: boolean;
  onReplace: (files: File[]) => void;
  onRemove: () => void;
}

export function ProtectFileCard({ document: doc, disabled, onReplace, onRemove }: ProtectFileCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length > 0) onReplace(files);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-background/60 p-3 sm:flex-nowrap sm:p-4"
    >
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <PdfFileIcon className="size-6" />
      </div>

      <div className="min-w-0 flex-1 basis-40">
        <p className="truncate text-sm font-bold text-foreground sm:text-base" title={doc.name}>
          {doc.name}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          {formatFileSize(doc.sizeBytes)} ·{" "}
          {doc.pageCount !== null ? formatPageCount(doc.pageCount) : "Password-protected"}
        </p>
      </div>

      <div className="flex w-full shrink-0 gap-2 sm:w-auto">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={handleChange}
        />
        <ProtectButton
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="flex-1 sm:flex-none"
        >
          <RefreshIcon className="size-4" />
          Replace
        </ProtectButton>
        <ProtectButton variant="danger" onClick={onRemove} disabled={disabled} className="flex-1 sm:flex-none">
          <TrashIcon className="size-4" />
          Remove
        </ProtectButton>
      </div>
    </motion.div>
  );
}