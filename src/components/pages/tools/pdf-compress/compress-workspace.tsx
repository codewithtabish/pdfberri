"use client";

import { CompressAdvancedSettings } from "./compress-advanced-settings";
import { CompressError } from "./compress-error";
import { CompressFileCard } from "./compress-file-card";
import { CompressModeSelector } from "./compress-mode-selector";
import { CompressPrivacyNote } from "./compress-privacy-note";
import { CompressProcessingMethod } from "./compress-processing-method";
import { CompressProgressPanel } from "./compress-progress";
import { CompressResults } from "./compress-results";
import { CompressUploadZone } from "./compress-upload-zone";
import { useCompressWorkspace } from "./use-compress-workspace";
import { CompressIcon } from "@/components/general/icons/pdf-icons";

export function CompressWorkspace() {
  const w = useCompressWorkspace();
  const processing = w.status === "processing" || w.status === "validating-result";
  const showResult = w.result && (w.status === "completed" || w.status === "no-reduction");
  const showError = w.status === "failed" && w.error;

  const announcement = showResult
    ? "Your compressed PDF is ready."
    : processing
      ? "Compressing your PDF."
      : w.error
        ? w.error
        : "";

  return (
    <div className="space-y-4">
      <p role="status" aria-live="polite" className="sr-only">{announcement}</p>

      {!w.doc ? (
        <CompressUploadZone loading={w.status === "validating"} error={w.error} onFile={w.loadFile} />
      ) : showResult && w.result ? (
        <CompressResults
          result={w.result}
          notice={w.notice}
          onTryAgain={w.backToEditing}
          onStartOver={w.reset}
        />
      ) : showError ? (
        <CompressError message={w.error!} onRetry={w.canCompress ? w.startCompress : undefined} onBack={w.backToEditing} />
      ) : (
        <section aria-label="Compress PDF workspace" className="space-y-4 rounded-2xl border border-border bg-card p-3 sm:p-5">
          <CompressFileCard doc={w.doc} disabled={processing} onReplace={w.loadFile} onRemove={w.removeFile} />

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="space-y-4">
              <CompressModeSelector value={w.mode} onChange={w.setMode} disabled={processing} />
              <CompressAdvancedSettings value={w.custom} onChange={w.setCustom} disabled={processing || w.mode !== "custom"} />
            </div>
            <div className="space-y-4">
              <CompressProcessingMethod value={w.method} onChange={w.setMethod} disabled={processing} />

              {processing ? (
                <CompressProgressPanel progress={w.progress} onCancel={w.cancelCompress} />
              ) : (
                <button
                  type="button"
                  onClick={w.startCompress}
                  disabled={!w.canCompress}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <CompressIcon className="size-5" />
                  Compress PDF
                </button>
              )}

              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CompressIcon className="size-3.5" />
                Lossless structural optimization. Images are not recompressed.
              </p>
            </div>
          </div>

          <CompressPrivacyNote />
        </section>
      )}
    </div>
  );
}