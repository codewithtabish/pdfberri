"use client";

import { useState, useRef } from "react";
import { OcrUpload } from "./ocr-upload";
import { OcrSettings } from "./ocr-settings";
import { OcrProgressUI } from "./ocr-progress";
import { OcrResult } from "./ocr-result";
import { processOcrPdf } from "./ocr-engine";
import type { OcrProgress } from "./ocr-types";
import { getOcrFileName } from "./ocr-utils";
import PopularTools from "../../home/popular-tools";

type Stage = "upload" | "settings" | "processing" | "result";

export function OcrPdf() {
  const [stage, setStage] = useState<Stage>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [languages, setLanguages] = useState<string[]>(["eng"]);
  const [progress, setProgress] = useState<OcrProgress | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setStage("settings");
    setError(null);
  };

  const handleProcess = async () => {
    if (!file) return;
    setStage("processing");
    setError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const blob = await processOcrPdf(
        file,
        languages,
        (p) => setProgress(p),
        controller.signal
      );

      setResultBlob(blob);
      setStage("result");
    } catch (e) {
      if (controller.signal.aborted) {
        setStage("settings");
      } else {
        setError(e instanceof Error ? e.message : "An unknown error occurred.");
        setStage("settings");
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleReset = () => {
    setFile(null);
    setResultBlob(null);
    setProgress(null);
    setStage("upload");
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Make your PDF searchable</h1>
        <p className="mt-2 text-muted-foreground">
          Recognize text in scanned documents while preserving the original layout and quality.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      {stage === "upload" && (
        <OcrUpload onFile={handleFile} />
      )}

      {stage === "settings" && file && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <div className="p-4 border border-border rounded-xl bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-md">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={handleReset} className="text-sm font-medium text-destructive hover:underline">Remove</button>
            </div>
            
            <div className="p-4 border border-border rounded-xl bg-card text-sm text-muted-foreground">
              <p>Processing happens entirely in your browser. Your documents never leave your device.</p>
            </div>
          </div>

          <OcrSettings 
            selectedLanguages={languages} 
            onLanguageChange={setLanguages} 
            onProcess={handleProcess} 
          />
        </div>
      )}

      {stage === "processing" && progress && (
        <OcrProgressUI progress={progress} onCancel={handleCancel} />
      )}

      {stage === "result" && resultBlob && file && (
        <OcrResult 
          fileName={getOcrFileName(file.name)} 
          blob={resultBlob} 
          languages={languages} 
          onReset={handleReset} 
        />
      )}
      <PopularTools/>
    </div>
  );
}