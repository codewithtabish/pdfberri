"use client";

import { useRef, useState, type DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PowerpointIcon, UploadIcon } from "@/components/general/icons/pdf-icons";
import { ACCEPT_ATTRIBUTE, MAX_FILE_BYTES } from "./powerpoint-to-pdf-constants";
import { formatBytes } from "./powerpoint-to-pdf-utils";

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function PowerPointToPdfUploadZone({ onFile, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = event.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-10 text-center transition-colors sm:py-14",
        dragging ? "border-primary bg-primary/5" : "border-primary/40 bg-card",
      )}
    >
      <PowerpointIcon className="size-14 text-orange-600" />
      <div>
        <p className="text-lg font-bold text-foreground sm:text-xl">Drop your PowerPoint file here</p>
        <p className="text-sm text-muted-foreground">or browse files from your device</p>
      </div>
      <Button type="button" size="lg" disabled={disabled} onClick={() => inputRef.current?.click()}>
        <UploadIcon className="size-5" />
        Select PowerPoint File
      </Button>
      <p className="text-xs text-muted-foreground">PPT, PPTX · Up to {formatBytes(MAX_FILE_BYTES)}</p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onFile(file);
        }}
      />
    </div>
  );
}
