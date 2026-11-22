// src/components/pages/tools/word-to-pdf/word-to-pdf-workspace.tsx
"use client";

import { useCallback, useRef, type ChangeEvent } from "react";

import { RefreshIcon } from "@/components/general/icons/pdf-icons";

import { WordButton } from "./word-to-pdf-button";
import { WordConsent } from "./word-to-pdf-consent";
import {
  FILE_INPUT_ACCEPT,
  WORD_TO_PDF_LIMITS,
} from "./word-to-pdf-constants";
import { getEngine } from "./word-to-pdf-engine";
import { WordErrorNotice } from "./word-to-pdf-error";
import { WordFileCard } from "./word-to-pdf-file-card";
import { WordProgress } from "./word-to-pdf-progress";
import { WordResult } from "./word-to-pdf-result";
import { WordConversionSettings } from "./word-to-pdf-settings";
import { WordUploadZone } from "./word-to-pdf-upload-zone";
import { formatBytes } from "./word-to-pdf-utils";
import { useWordToPdfWorkspace } from "./use-word-to-pdf-workspace";

export function WordToPdfWorkspace() {
  const ws = useWordToPdfWorkspace();
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    void ws.selectFile(files);
  };

  const legacyDocEnabled = ws.cloud.status === "available";
  const maxFileLabel = formatBytes(WORD_TO_PDF_LIMITS.maxFileBytes);
  const serverMaxLabel =
    ws.cloud.status === "available"
      ? formatBytes(ws.cloud.maxFileBytes)
      : formatBytes(WORD_TO_PDF_LIMITS.maxLegacyFileBytes);

  const file = ws.file;
  const showUpload = file === null;
  const showReady = file !== null && (ws.phase === "ready" || ws.phase === "cancelled");
  const showConverting = file !== null && ws.phase === "converting";
  const showSuccess = file !== null && ws.phase === "success" && ws.result !== null;
  const showError = file !== null && ws.phase === "error" && ws.error !== null;

  const supportedSettings = ws.engineChoice
    ? getEngine(ws.engineChoice).supportedSettings
    : [];

  return (
    <section
      aria-labelledby="word-to-pdf-tool-heading"
      className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-6"
    >
      <h2 id="word-to-pdf-tool-heading" className="sr-only">
        Convert a Word document to PDF
      </h2>

      <input
        ref={inputRef}
        type="file"
        accept={FILE_INPUT_ACCEPT}
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      <p role="status" aria-live="polite" className="sr-only">
        {ws.announcement}
      </p>

      <div className="flex flex-col gap-5">
        {ws.selectionError ? (
          <WordErrorNotice
            error={ws.selectionError}
            onDismiss={ws.dismissSelectionError}
          />
        ) : null}

        {showUpload ? (
          <WordUploadZone
            onBrowse={openPicker}
            onFilesDropped={(files) => void ws.selectFile(files)}
            legacyDocEnabled={legacyDocEnabled}
            maxFileLabel={maxFileLabel}
            isChecking={ws.phase === "validating"}
          />
        ) : null}

        {showReady && file ? (
          <>
            {ws.phase === "cancelled" ? (
              <p
                role="status"
                className="rounded-xl border border-border bg-muted/40 p-3 text-sm text-muted-foreground"
              >
                Conversion cancelled. No PDF was created, and your document is
                still selected.
              </p>
            ) : null}

            <WordFileCard
              file={file}
              statusLabel="Ready to convert"
              onReplace={openPicker}
              onRemove={ws.reset}
            />

            <WordConversionSettings
              settings={ws.settings}
              supported={supportedSettings}
              onChange={ws.updateSettings}
            />

            {ws.needsConsent ? (
              <WordConsent
                checked={ws.consent}
                onChange={ws.setConsent}
                reason="legacy"
                maxFileLabel={serverMaxLabel}
              />
            ) : null}

            <WordButton
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!ws.canConvert}
              onClick={() => void ws.convert()}
            >
              <RefreshIcon className="size-5" />
              Convert to PDF
            </WordButton>
          </>
        ) : null}

        {showConverting && file ? (
          <>
            <WordFileCard file={file} statusLabel="Converting…" />
            <WordProgress
              progress={ws.progress}
              onCancel={ws.cancel}
              processesLocally={ws.activeEngine === "local"}
            />
          </>
        ) : null}

        {showSuccess && ws.result ? (
          <WordResult
            fileName={ws.result.fileName}
            sizeBytes={ws.result.sizeBytes}
            pageCount={ws.result.pageCount}
            engine={ws.result.engine}
            downloadState={ws.downloadState}
            onDownload={ws.download}
            onConvertAnother={ws.reset}
          />
        ) : null}

        {showError && file && ws.error ? (
          <>
            <WordFileCard file={file} statusLabel="Selected" onRemove={ws.reset} />
            <WordErrorNotice error={ws.error}>
              {ws.serverFallbackAvailable ? (
                <WordConsent
                  checked={ws.consent}
                  onChange={ws.setConsent}
                  reason="fallback"
                  maxFileLabel={serverMaxLabel}
                />
              ) : null}
              <div className="flex flex-wrap gap-3">
                {ws.serverFallbackAvailable ? (
                  <WordButton
                    variant="primary"
                    disabled={!ws.consent}
                    onClick={() => void ws.convert({ preferCloud: true })}
                  >
                    Convert on the server instead
                  </WordButton>
                ) : null}
                <WordButton onClick={ws.backToReady}>Try again</WordButton>
                <WordButton onClick={openPicker}>Choose another document</WordButton>
              </div>
            </WordErrorNotice>
          </>
        ) : null}
      </div>
    </section>
  );
}
