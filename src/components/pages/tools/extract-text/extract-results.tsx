"use client";

import { useState } from "react";
import type { ExtractResult } from "./extract-types";
import { getExtractedFileName } from "./extract-utils";

interface Props {
  result: ExtractResult;
  onReset: () => void;
}

export function ExtractResults({ result, onReset }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("Failed to copy text. Your browser may have denied clipboard access.");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([result.extractedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = getExtractedFileName(result.fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasText = result.extractedText.length > 0;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col md:flex-row items-center justify-between p-6 border border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/10 rounded-xl gap-6">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/50 dark:text-green-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Text extracted successfully!</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.pagesWithText.length} of {result.selectedPages.length} selected pages contained text.
            </p>
            {result.emptyPages.length > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Pages {result.emptyPages.join(", ")} had no extractable text.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handleCopy} disabled={!hasText} className="flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors">
            {copied ? "Copied!" : "Copy All Text"}
          </button>
          <button onClick={handleDownload} disabled={!hasText} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Download TXT
          </button>
          <button onClick={onReset} className="flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
            Extract Another
          </button>
        </div>
      </div>

      {!hasText ? (
        <div className="p-8 text-center border border-border rounded-xl bg-card">
          <p className="text-muted-foreground mb-4">This PDF appears to contain scanned pages or images instead of selectable text.</p>
          <a href="/tools/ocr-pdf" className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Try OCR PDF
          </a>
        </div>
      ) : (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <div className="p-3 bg-muted/50 border-b border-border flex justify-between text-xs text-muted-foreground">
            <span>Preview</span>
            <span>{result.characterCount.toLocaleString()} characters • {result.wordCount.toLocaleString()} words</span>
          </div>
          <div className="p-4 overflow-auto max-h-[500px]">
            <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">
              {result.extractedText}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}