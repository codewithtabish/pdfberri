"use client";

import { useEffect, useRef, useState } from "react";
import { ExtractUpload } from "./extract-upload";
import { ExtractProgressUI } from "./extract-progress";
import { ExtractGallery } from "./extract-gallery";
import { extractImagesFromPdf } from "./extract-engine";
import { formatBytes } from "./extract-utils";
import type { ExtractProgress, ExtractResult } from "./extract-types";

type Stage = "upload" | "processing" | "result";

function revokeResult(result: ExtractResult | null) {
  result?.images.forEach((img) => URL.revokeObjectURL(img.url));
}

export function ExtractImages() {
  const [stage, setStage] = useState<Stage>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<ExtractProgress | null>(null);
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const resultRef = useRef<ExtractResult | null>(null);

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      revokeResult(resultRef.current);
    };
  }, []);

  const handleFile = async (f: File) => {
    revokeResult(resultRef.current);
    setResult(null);
    setFile(f);
    setError(null);
    setProgress({
      stage: "loading",
      currentPage: 0,
      totalPages: 0,
      message: "Loading PDF...",
      percent: 0,
    });
    setStage("processing");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await extractImagesFromPdf(f, (p) => setProgress(p), controller.signal);
      if (controller.signal.aborted) {
        revokeResult(res);
        return;
      }
      setResult(res);
      setStage("result");
    } catch (e) {
      setStage("upload");
      setFile(null);
      if (!controller.signal.aborted) {
        setError(e instanceof Error ? e.message : "Extraction failed.");
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
  };

  const handleReset = () => {
    revokeResult(result);
    setFile(null);
    setResult(null);
    setProgress(null);
    setError(null);
    setStage("upload");
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Extract Images from PDF</h1>
        <p className="mt-2 text-muted-foreground">
          Extract and download the images embedded in your PDF documents.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      {stage === "upload" && <ExtractUpload onFile={handleFile} />}

      {stage === "processing" && progress && (
        <ExtractProgressUI progress={progress} onCancel={handleCancel} />
      )}

      {stage === "result" && result && (
        <>
          <div className="p-4 border border-border rounded-xl bg-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-md">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{result.fileName}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file?.size ?? 0)}</p>
              </div>
            </div>
            <button onClick={handleReset} className="text-sm font-medium text-destructive hover:underline">Remove</button>
          </div>

          {result.skipped > 0 && (
            <div className="p-3 rounded-md border border-border bg-card text-sm text-muted-foreground">
              {result.skipped} image{result.skipped === 1 ? "" : "s"} could not be converted and {result.skipped === 1 ? "was" : "were"} skipped.
            </div>
          )}
          
          {result.images.length === 0 ? (
            <div className="p-12 text-center border border-border rounded-xl bg-card">
              <p className="text-lg font-medium text-foreground mb-2">No extractable images were found.</p>
              <p className="text-sm text-muted-foreground">This document may only contain text, vector graphics, or unsupported image formats.</p>
            </div>
          ) : (
            <ExtractGallery 
              images={result.images} 
              originalFileName={result.fileName} 
              onReset={handleReset} 
            />
          )}
        </>
      )}
    </div>
  );
}