"use client";

import { useState } from "react";
import { useHtmlToPdf } from "./use-html-to-pdf";
import { HtmlToPdfInputMode } from "./html-to-pdf-input-mode";
import { HtmlToPdfUpload } from "./html-to-pdf-upload";
import { HtmlToPdfCodeInput } from "./html-to-pdf-code-input";
import { HtmlToPdfUrlInput } from "./html-to-pdf-url-input";
import { HtmlToPdfSettings } from "./html-to-pdf-settings";
import { HtmlToPdfAdvancedSettings } from "./html-to-pdf-advanced-settings";
import { HtmlToPdfProgress } from "./html-to-pdf-progress";
import { HtmlToPdfResult } from "./html-to-pdf-result";
import { HtmlToPdfError } from "./html-to-pdf-error";
import { HtmlToPdfPopularTools } from "./html-to-pdf-popular-tools";
import { HtmlToPdfFaq } from "./html-to-pdf-faq";
import type { HtmlInput } from "./html-to-pdf-types";

export function HtmlToPdfWorkspace() {
  const {
    stage,
    inputMode,
    setInputMode,
    settings,
    updateSettings,
    result,
    error,
    stageMessage,
    progress,
    isProcessing,
    convert,
    cancel,
    reset,
  } = useHtmlToPdf();

  const [file, setFile] = useState<File | null>(null);
  const [code, setCode] = useState("");
  const [url, setUrl] = useState("");

  const canConvert =
    !isProcessing &&
    ((inputMode === "file" && !!file) ||
      (inputMode === "code" && code.trim().length > 0) ||
      (inputMode === "url" && url.trim().length > 0));

  const handleConvert = () => {
    const input: HtmlInput = { mode: inputMode };
    if (inputMode === "file" && file) {
      input.file = file;
      input.filename = file.name;
    } else if (inputMode === "code") {
      input.content = code;
    } else if (inputMode === "url") {
      input.url = url;
    }
    convert(input);
  };

  const handleConvertAnother = () => {
    reset();
    setFile(null);
    // keep code/url if user wants, or clear — clear for clean UX
    setCode("");
    setUrl("");
  };

  // Success state
  if (stage === "completed" && result) {
    return (
      <div className="space-y-10">
        <HtmlToPdfResult result={result} onConvertAnother={handleConvertAnother} />
        <HtmlToPdfPopularTools />
        <div className="grid gap-8 md:grid-cols-2">
          <HowToSection />
          <HtmlToPdfFaq />
        </div>
      </div>
    );
  }

  // Error state
  if (stage === "failed" && error) {
    return (
      <div className="space-y-10">
        <HtmlToPdfError
          error={error}
          onRetry={handleConvert}
          onReset={handleConvertAnother}
        />
        <HtmlToPdfPopularTools />
      </div>
    );
  }

  // Processing state
  if (isProcessing) {
    return (
      <div className="space-y-10">
        <HtmlToPdfProgress
          stage={stage}
          message={stageMessage}
          progress={progress}
          onCancel={cancel}
        />
      </div>
    );
  }

  // Default / input state
  return (
    <div className="space-y-8">
      {/* Main card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <HtmlToPdfInputMode
          mode={inputMode}
          onChange={(m) => {
            setInputMode(m);
            // clear error when switching
          }}
          disabled={isProcessing}
        />

        <div className="p-5 sm:p-6">
          {inputMode === "file" && (
            <HtmlToPdfUpload
              selectedFile={file}
              onFileSelected={setFile}
              onClear={() => setFile(null)}
              disabled={isProcessing}
            />
          )}
          {inputMode === "code" && (
            <HtmlToPdfCodeInput value={code} onChange={setCode} disabled={isProcessing} />
          )}
          {inputMode === "url" && (
            <HtmlToPdfUrlInput value={url} onChange={setUrl} disabled={isProcessing} />
          )}
        </div>
      </div>

      {/* Settings row */}
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <HtmlToPdfSettings
          settings={settings}
          onChange={updateSettings}
          disabled={isProcessing}
        />
        <HtmlToPdfAdvancedSettings
          settings={settings}
          onChange={updateSettings}
          disabled={isProcessing}
        />
      </div>

      {/* Convert button */}
      <div className="flex justify-center">
        <button
          type="button"
          disabled={!canConvert}
          onClick={handleConvert}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-10 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Convert to PDF
        </button>
      </div>

      <HtmlToPdfPopularTools />

      <div className="grid gap-8 md:grid-cols-2">
        <HowToSection />
        <HtmlToPdfFaq />
      </div>
    </div>
  );
}

function HowToSection() {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">How to convert HTML to PDF</h2>
      <ol className="space-y-3">
        {[
          "Upload an HTML file, paste HTML code, or enter a supported webpage URL.",
          "Choose your PDF settings.",
          "Convert and download your PDF.",
        ].map((text, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {i + 1}
            </span>
            <span className="pt-0.5 text-muted-foreground">{text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
