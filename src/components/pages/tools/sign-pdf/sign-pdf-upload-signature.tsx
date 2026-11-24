"use client";
import { useRef } from "react";
import { UploadIcon } from "@/components/general/icons/pdf-icons";
import { processUploadedSignature } from "./sign-pdf-image-processor";

export function SignPdfUploadSignature({ onSave }: { onSave: (dataUrl: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-3">
      <button onClick={() => inputRef.current?.click()} className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 hover:bg-muted/40">
        <UploadIcon className="h-6 w-6 text-muted-foreground" />
        <span className="text-xs font-medium">Upload Image</span>
        <span className="text-[10px] text-muted-foreground">PNG, JPG</span>
      </button>
      <input ref={inputRef} type="file" accept="image/png, image/jpeg" className="hidden" onChange={async (e) => {
        const file = e.target.files?.[0];
        if (file) {
          try { onSave(await processUploadedSignature(file)); }
          catch (err) { alert("Invalid image file"); }
        }
      }} />
    </div>
  );
}