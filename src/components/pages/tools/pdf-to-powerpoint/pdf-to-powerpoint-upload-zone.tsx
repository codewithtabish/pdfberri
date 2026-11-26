"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoaderIcon, UploadIcon } from "@/components/general/icons/pdf-icons";

interface Props {
  onSelect: (file: File) => void;
  loading: boolean;
}

export function PdfToPowerpointUploadZone({ onSelect, loading }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const pick = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onSelect(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        pick(e.dataTransfer.files);
      }}
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 p-8 text-center transition-colors sm:p-12",
        dragging && "border-primary bg-primary/5",
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {loading ? (
          <LoaderIcon className="size-7 animate-spin motion-reduce:animate-none" />
        ) : (
          <UploadIcon className="size-7" />
        )}
      </div>
      <h2 className="text-xl font-bold text-foreground">
        {loading ? "Reading your PDF…" : "Drop your PDF here"}
      </h2>
      <p className="text-sm text-muted-foreground">or select a file from your device</p>
      <Button size="lg" disabled={loading} onClick={() => inputRef.current?.click()}>
        <UploadIcon className="size-5" />
        Choose PDF
      </Button>
      <p className="text-xs text-muted-foreground">PDF files up to 100 MB. Files stay on your device.</p>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
