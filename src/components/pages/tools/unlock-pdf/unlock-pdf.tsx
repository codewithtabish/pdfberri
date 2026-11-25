// src/components/pages/tools/unlock-pdf/unlock-pdf.tsx

"use client";

import { useState } from "react";
import { UnlockPdfUpload } from "./unlock-pdf-upload";
import { UnlockPdfDocument } from "./unlock-pdf-document";
import { UnlockPdfPassword } from "./unlock-pdf-password";
import { UnlockPdfResult } from "./unlock-pdf-result";
import type { UnlockState, UnlockErrorCode } from "./unlock-pdf.types";
import { validatePDFFile } from "./unlock-pdf.validation";
import { decryptPDF } from "./unlock-pdf.engine";
import { getErrorMessage } from "./unlock-pdf.utils";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  UnlockIcon,
  PDF_TOOL_ICONS,
  type PdfToolIconKey,
} from "@/components/general/icons/pdf-icons";

const RELATED_TOOLS: { name: string; key: PdfToolIconKey; href: string }[] = [
  { name: "Protect PDF", key: "protect-pdf", href: "/tools/protect-pdf" },
  { name: "Sign PDF", key: "sign-pdf", href: "/tools/sign-pdf" },
  { name: "Redact PDF", key: "redact-pdf", href: "/tools/redact-pdf" },
  { name: "Compress PDF", key: "compress-pdf", href: "/tools/compress-pdf" },
  { name: "Merge PDF", key: "merge-pdf", href: "/tools/merge-pdf" },
  { name: "Split PDF", key: "split-pdf", href: "/tools/split-pdf" },
];

export function UnlockPdf() {
  const [state, setState] = useState<UnlockState>({
    status: "idle",
    file: null,
    pageCount: null,
    unlockedBlob: null,
    unlockedUrl: null,
    error: null,
  });

  const handleFileSelect = async (file: File) => {
    setState((prev) => ({ ...prev, error: null }));

    const validation = await validatePDFFile(file);
    if (!validation.valid) {
      setState({
        status: "error",
        file: null,
        pageCount: null,
        unlockedBlob: null,
        unlockedUrl: null,
        error: validation.error ?? "corrupted",
      });
      return;
    }

    // We do NOT parse the PDF here to avoid the encryption error.
    // The engine will return the page count after unlocking.
    setState({
      status: "awaiting-password",
      file,
      pageCount: null, 
      unlockedBlob: null,
      unlockedUrl: null,
      error: null,
    });
  };

  const handleUnlock = async (password: string) => {
    if (!state.file) return;
    if (!password) {
      setState((prev) => ({ ...prev, error: "incorrect-password" }));
      return;
    }

    setState((prev) => ({ ...prev, status: "processing", error: null }));

    const buffer = await state.file.arrayBuffer();
    
    const result = await decryptPDF({
      fileBuffer: buffer,
      password,
    });

    if (result.success && result.output) {
      const url = URL.createObjectURL(result.output.blob);
      setState((prev) => ({
        ...prev,
        status: "success",
        unlockedBlob: result.output!.blob,
        unlockedUrl: url,
        pageCount: result.output!.pageCount,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        status: "awaiting-password", 
        error: (result.error ?? "processing-failed") as UnlockErrorCode,
      }));
    }
  };

  const handleReset = () => {
    if (state.unlockedUrl) URL.revokeObjectURL(state.unlockedUrl);
    setState({
      status: "idle",
      file: null,
      pageCount: null,
      unlockedBlob: null,
      unlockedUrl: null,
      error: null,
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 py-8">
      <div className="text-center space-y-2">
        <h1 className="flex items-center justify-center gap-2 text-3xl font-bold tracking-tight">
          <UnlockIcon className="h-8 w-8 text-primary" />
          Unlock PDF
        </h1>
        <p className="mx-auto max-w-lg text-muted-foreground">
          Remove password protection from your PDF and access your document
          without entering the password every time.
        </p>
      </div>

      <div className="space-y-4">
        {state.error && state.status === "error" && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400"
          >
            <AlertCircleIcon className="h-5 w-5 shrink-0" />
            {getErrorMessage(state.error)}
          </div>
        )}

        {state.status === "idle" && (
          <UnlockPdfUpload onFileSelect={handleFileSelect} />
        )}

        {state.file && state.status !== "success" && (
          <>
            <UnlockPdfDocument
              file={state.file}
              pageCount={state.pageCount}
              onRemove={handleReset}
              onReplace={() => {
                handleReset();
                setTimeout(() => {
                  document
                    .querySelector<HTMLInputElement>('input[type="file"]')
                    ?.click();
                }, 100);
              }}
            />
            <UnlockPdfPassword
              onSubmit={handleUnlock}
              isProcessing={state.status === "processing"}
              error={state.error ? getErrorMessage(state.error) : null}
            />
          </>
        )}

        {state.status === "success" && state.file && state.unlockedBlob && (
          <UnlockPdfResult
            originalFile={state.file}
            unlockedBlob={state.unlockedBlob}
            pageCount={state.pageCount}
            onReset={handleReset}
            onError={(err) => setState((prev) => ({ ...prev, error: err as UnlockErrorCode }))}
          />
        )}
      </div>

      <div className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <CheckCircleIcon className="h-4 w-4 text-green-500" />
        Your documents stay private. Files are processed locally in your
        browser.
      </div>

      <div className="space-y-4 border-t border-border pt-8">
        <h2 className="text-lg font-semibold">Related PDF Tools</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {RELATED_TOOLS.map((tool) => {
            const Icon = PDF_TOOL_ICONS[tool.key];
            return (
              <a
                key={tool.key}
                href={tool.href}
                className="flex flex-col items-center gap-2 rounded-xl border border-border p-3 text-center transition-colors hover:bg-muted"
              >
                <Icon className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium">{tool.name}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}