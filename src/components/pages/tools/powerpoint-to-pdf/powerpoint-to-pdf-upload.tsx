"use client";

import { useRef, useState } from "react";
import { UploadIcon } from "@/components/general/icons/pdf-icons";
import * as JSZip from "jszip";

interface Props {
  onUpload: (file: File, slideCount: number) => void;
}

export function PowerPointToPdfUpload({ onUpload }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.name.match(/\.(pptx|ppt)$/i)) {
      setError("Please select a valid PowerPoint file (.ppt or .pptx).");
      return;
    }
    setError(null);
    setIsInspecting(true);

    try {
      if (file.name.endsWith(".pptx")) {
        // Basic inspection using JSZip for PPTX
        const zip = await JSZip.loadAsync(file);
        const slideFiles = Object.keys(zip.files).filter(name => name.match(/^ppt\/slides\/slide\d+\.xml$/));
        const slideCount = slideFiles.length;
        if (slideCount === 0) throw new Error("No slides found in presentation.");
        onUpload(file, slideCount);
      } else {
        // For legacy .ppt, we cannot reliably inspect client-side, so we pass a default or handle on server
        onUpload(file, -1); // -1 indicates unknown, will be handled by server
      }
    } catch (e) {
      setError("Could not read PowerPoint file. It may be corrupted.");
    } finally {
      setIsInspecting(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div 
        className={`w-full border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border bg-card"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
        }}
      >
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 2v6h6"/></svg>
        </div>
        
        <h3 className="text-xl font-bold mb-2 text-center">Drop your PowerPoint files here</h3>
        <p className="text-sm text-muted-foreground mb-6 text-center">or browse files from your device</p>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isInspecting}
          className="bg-primary text-primary-foreground font-semibold py-2.5 px-8 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          {isInspecting ? "Inspecting..." : "Select PowerPoint Files"}
        </button>
        
        <p className="mt-6 text-xs text-muted-foreground">PPT, PPTX • Up to 100 MB</p>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".ppt,.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
          }}
        />
      </div>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}