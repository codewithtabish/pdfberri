"use client";

import { useState } from "react";
import { PowerPointToPdfUpload } from "./powerpoint-to-pdf-upload";
import { PowerPointToPdfResult } from "./powerpoint-to-pdf-result";
import { getPdfFileName } from "./powerpoint-to-pdf-utils";
import type { PowerPointState } from "./powerpoint-to-pdf-types";
import { LoaderIcon } from "@/components/general/icons/pdf-icons";

export function PowerPointToPdf() {
  const [state, setState] = useState<PowerPointState>({
    file: null,
    totalSlides: 0,
    outputBlob: null,
    pdfUrl: null,
    progress: { stage: "idle", message: "", percent: 0 },
    error: null,
  });

  const handleUpload = async (file: File, slideCount: number) => {
    setState(prev => ({
      ...prev,
      file,
      totalSlides: slideCount,
      progress: { stage: "converting", message: "Converting to PDF...", percent: 50 },
      error: null,
    }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/tools/powerpoint-to-pdf/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to convert presentation.");
      }

      const blob = await response.blob();
      setState(prev => ({
        ...prev,
        outputBlob: blob,
        progress: { stage: "completed", message: "Conversion complete", percent: 100 },
      }));
    } catch (e) {
      setState(prev => ({
        ...prev,
        error: e instanceof Error ? e.message : "An unknown error occurred.",
        progress: { stage: "error", message: "Failed", percent: 0 },
      }));
    }
  };

  const handleDownload = () => {
    if (!state.outputBlob || !state.file) return;
    const url = URL.createObjectURL(state.outputBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = getPdfFileName(state.file.name);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setState({
      file: null,
      totalSlides: 0,
      outputBlob: null,
      pdfUrl: null,
      progress: { stage: "idle", message: "", percent: 0 },
      error: null,
    });
  };

  const isConverting = state.progress.stage === "converting";

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 py-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold mb-4">
          <span className="w-2 h-2 rounded-full bg-orange-600"></span>
          PPT → PDF
        </div>
        <h1 className="text-4xl font-extrabold text-foreground mb-3 tracking-tight">
          PowerPoint to <span className="text-primary">PDF</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Convert your PowerPoint presentations into professional PDF documents in seconds.
        </p>
      </div>

      {state.error && (
        <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium text-center">
          {state.error}
        </div>
      )}

      {!state.file && (
        <PowerPointToPdfUpload onUpload={handleUpload} />
      )}

      {isConverting && (
        <div className="flex flex-col items-center justify-center py-20 border border-border rounded-xl bg-card">
          <LoaderIcon className="w-12 h-12 text-primary animate-spin mb-4" />
          <h3 className="text-xl font-bold mb-2">Converting your presentation...</h3>
          <p className="text-sm text-muted-foreground">Please wait while we generate your PDF.</p>
        </div>
      )}

      {state.outputBlob && state.file && (
        <PowerPointToPdfResult
          blob={state.outputBlob}
          fileName={getPdfFileName(state.file.name)}
          slideCount={state.totalSlides}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      )}
    </div>
  );
}