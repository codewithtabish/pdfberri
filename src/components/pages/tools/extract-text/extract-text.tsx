"use client";

import { useState, useRef } from "react";
import { ExtractUpload } from "./extract-upload";
import { ExtractSettings } from "./extract-settings";
import { ExtractProgressUI } from "./extract-progress";
import { ExtractResults } from "./extract-results";
import { extractTextFromPdf } from "./extract-engine";
import { parsePageRanges } from "./extract-utils";
import type { ExtractProgress, ExtractResult } from "./extract-types";

type Stage = "upload" | "settings" | "processing" | "result";

export function ExtractText() {
  const [stage, setStage] = useState<Stage>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [progress, setProgress] = useState<ExtractProgress | null>(null);
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFile = async (f: File) => {
    setFile(f);
    setError(null);
    
    try {
      // Quick inspect for page count
      const pdfjs = await import("pdfjs-dist");
      const arrayBuffer = await f.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      setTotalPages(doc.numPages);
      setStage("settings");
    } catch (e) {
      setError("Could not read PDF. It may be encrypted or corrupted.");
    }
  };

  const handleProcess = async (options: any, rangeString: string) => {
    if (!file) return;
    setStage("processing");
    setError(null);

    let selectedPages: number[] = [];
    try {
      if (rangeString) {
        selectedPages = parsePageRanges(rangeString, totalPages);
        if (selectedPages.length === 0) throw new Error("No valid pages selected.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid page range.");
      setStage("settings");
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await extractTextFromPdf(
        file,
        selectedPages,
        options,
        (p) => setProgress(p),
        controller.signal
      );
      setResult(res);
      setStage("result");
    } catch (e) {
      if (controller.signal.aborted) {
        setStage("settings");
      } else {
        setError(e instanceof Error ? e.message : "Extraction failed.");
        setStage("settings");
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setProgress(null);
    setStage("upload");
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Extract Text from PDF</h1>
        <p className="mt-2 text-muted-foreground">
          Extract text from your PDF documents instantly. Copy, search, and download the extracted content.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      {stage === "upload" && <ExtractUpload onFile={handleFile} />}

      {stage === "settings" && file && (
        <div className="flex flex-col gap-4">
          <div className="p-4 border border-border rounded-xl bg-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-md">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB • {totalPages} pages</p>
              </div>
            </div>
            <button onClick={handleReset} className="text-sm font-medium text-destructive hover:underline">Remove</button>
          </div>

          <ExtractSettings onProcess={handleProcess} />
        </div>
      )}

      {stage === "processing" && progress && (
        <ExtractProgressUI progress={progress} onCancel={handleCancel} />
      )}

      {stage === "result" && result && (
        <ExtractResults result={result} onReset={handleReset} />
      )}
    </div>
  );
}