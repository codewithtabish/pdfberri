// src/components/pages/tools/pdf-to-word/pdf-to-word-workspace.tsx
"use client";

import { useId } from "react";
import {
  RefreshIcon,
  SettingsIcon,
} from "@/components/general/icons/pdf-icons";
import { Button } from "@/components/ui/button";
import { PdfToWordError } from "./pdf-to-word-error";
import {
  PdfToWordFileCard,
  type FileCardStatus,
} from "./pdf-to-word-file-card";
import { PdfToWordModeSelector } from "./pdf-to-word-mode-selector";
import { PdfToWordOcrSettings } from "./pdf-to-word-ocr-settings";
import { PdfToWordPasswordForm } from "./pdf-to-word-password-form";
import { PdfToWordPrivacyNote } from "./pdf-to-word-privacy-note";
import { PdfToWordProgress } from "./pdf-to-word-progress";
import { PdfToWordResult } from "./pdf-to-word-result";
import { PdfToWordUploadZone } from "./pdf-to-word-upload-zone";
import { PROCESS_STAGES } from "./pdf-to-word-constants";
import type { WorkspaceState } from "./pdf-to-word-types";
import { usePdfToWordWorkspace } from "./use-pdf-to-word-workspace";

function cardStatus(state: WorkspaceState): FileCardStatus {
  switch (state.status) {
    case "validating":
      return "checking";
    case "needs-password":
      return "password";
    case "converting":
      return "converting";
    case "completed":
      return "done";
    case "failed":
      return "error";
    default:
      return "ready";
  }
}

function announcement(state: WorkspaceState): string {
  switch (state.status) {
    case "validating":
      return "Checking your PDF.";
    case "needs-password":
      return "This PDF needs a password.";
    case "ready":
      return "PDF ready. Choose your settings and convert.";
    case "converting": {
      const stage = state.progress?.stage ?? "reading";
      return `${PROCESS_STAGES.find((s) => s.id === stage)?.label ?? "Converting"}.`;
    }
    case "completed":
      return "Your Word document is ready to download.";
    case "failed":
      return state.error.message;
    case "cancelled":
      return "Conversion cancelled.";
    default:
      return "";
  }
}

export function PdfToWordWorkspace() {
  const headingId = useId();
  const {
    state,
    options,
    selectFile,
    submitPassword,
    convert,
    cancel,
    reset,
    setMode,
    setOcrEnabled,
    setOcrLanguage,
  } = usePdfToWordWorkspace();

  const file = "file" in state ? state.file : null;
  const inspection = "inspection" in state ? state.inspection : null;
  const busy = state.status === "validating" || state.status === "converting";
  const canConvert =
    state.status === "ready" ||
    state.status === "cancelled" ||
    (state.status === "failed" && state.inspection !== null);

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6"
    >
      <h2 id={headingId} className="sr-only">
        PDF to Word converter workspace
      </h2>
      <div role="status" aria-live="polite" className="sr-only">
        {announcement(state)}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          {state.status === "needs-password" ? (
            <PdfToWordPasswordForm
              fileName={state.file.name}
              incorrect={state.incorrect}
              onSubmit={submitPassword}
              onCancel={reset}
            />
          ) : (
            <PdfToWordUploadZone onSelect={selectFile} disabled={busy} />
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          {file ? (
            <PdfToWordFileCard
              file={file}
              inspection={inspection}
              status={cardStatus(state)}
              onRemove={reset}
              removeDisabled={busy}
            />
          ) : (
            <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              No file selected yet. Choose a PDF to see its details here.
            </p>
          )}

          <div className="space-y-3">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <SettingsIcon className="size-5 text-primary" />
                Conversion settings
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose how you want your Word document to be reconstructed.
              </p>
            </div>
            <PdfToWordModeSelector
              value={options.mode}
              onChange={setMode}
              disabled={busy}
            />
            <PdfToWordOcrSettings
              enabled={options.ocrEnabled}
              language={options.ocrLanguage}
              recommended={Boolean(inspection?.likelyScanned)}
              disabled={busy}
              onEnabledChange={setOcrEnabled}
              onLanguageChange={setOcrLanguage}
            />
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              size="lg"
              className="w-full font-semibold"
              disabled={!canConvert}
              onClick={() => void convert()}
            >
              <RefreshIcon className="size-5" />
              {state.status === "converting" ? "Converting…" : "Convert to Word"}
            </Button>
            <PdfToWordPrivacyNote>
              Your original PDF remains unchanged. Conversion quality depends on
              the original PDF.
            </PdfToWordPrivacyNote>
          </div>
        </div>
      </div>

      {state.status === "converting" && (
        <div className="mt-5">
          <PdfToWordProgress
            progress={state.progress}
            ocrEnabled={options.ocrEnabled}
            onCancel={cancel}
          />
        </div>
      )}

      {state.status === "completed" && (
        <div className="mt-5">
          <PdfToWordResult
            originalName={state.file.name}
            result={state.result}
            onReset={reset}
          />
        </div>
      )}

      {state.status === "failed" && (
        <div className="mt-5">
          <PdfToWordError
            error={state.error}
            onRetry={state.inspection ? () => void convert() : undefined}
            onReset={reset}
          />
        </div>
      )}

      {state.status === "cancelled" && (
        <p
          role="status"
          className="mt-5 rounded-xl border border-border p-4 text-sm text-muted-foreground"
        >
          Conversion cancelled. Your PDF is still selected. Press “Convert to
          Word” to start again.
        </p>
      )}
    </section>
  );
}