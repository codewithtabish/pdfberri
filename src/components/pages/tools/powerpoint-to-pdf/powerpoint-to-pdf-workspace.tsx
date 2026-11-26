"use client";

import { Button } from "@/components/ui/button";
import { LoaderIcon, PdfFileIcon } from "@/components/general/icons/pdf-icons";
import { PowerPointToPdfError } from "./powerpoint-to-pdf-error";
import { PowerPointToPdfFileCard } from "./powerpoint-to-pdf-file-card";
import { PowerPointToPdfPreview } from "./powerpoint-to-pdf-preview";
import { PowerPointToPdfProgress } from "./powerpoint-to-pdf-progress";
import { PowerPointToPdfResult } from "./powerpoint-to-pdf-result";
import { PowerPointToPdfSettings } from "./powerpoint-to-pdf-settings";
import { PowerPointToPdfUploadZone } from "./powerpoint-to-pdf-upload-zone";
import { buildOutputFileName } from "./powerpoint-to-pdf-utils";
import { usePowerPointToPdf } from "./use-powerpoint-to-pdf";

export function PowerPointToPdfWorkspace() {
  const { state, settingsValidation, selectFile, removeFile, updateSettings, convert, downloadUrl } =
    usePowerPointToPdf();
  const { phase, file, job, error, settings } = state;

  const busy = phase === "uploading" || phase === "processing";
  const showSettings = job && (phase === "ready" || phase === "finalizing" || phase === "completed");
  const rangeError = settingsValidation && !settingsValidation.ok ? settingsValidation.error : null;
  const canConvert = phase === "ready" && settingsValidation?.ok === true;

  return (
    <section aria-label="PowerPoint to PDF converter" className="flex flex-col gap-4">
      {!file ? (
        <PowerPointToPdfUploadZone onFile={selectFile} />
      ) : (
        <PowerPointToPdfFileCard file={file} job={job} phase={phase} onReplace={selectFile} onRemove={removeFile} />
      )}

      {busy && <PowerPointToPdfProgress phase={phase} uploadPercent={state.uploadPercent} jobState={job?.state ?? null} />}

      {phase === "failed" && error && <PowerPointToPdfError message={error.message} onRetry={removeFile} />}

      {showSettings && (
        <>
          <PowerPointToPdfSettings
            settings={settings}
            job={job}
            rangeError={rangeError}
            disabled={phase === "finalizing"}
            onChange={updateSettings}
          />
          {phase === "ready" && error && (
            <p role="alert" className="text-center text-sm font-medium text-destructive">
              {error.message}
            </p>
          )}
          {phase !== "completed" && (
            <div className="flex justify-center">
              <Button type="button" size="lg" disabled={!canConvert} onClick={() => void convert()}>
                {phase === "finalizing" ? (
                  <LoaderIcon className="size-5 animate-spin motion-reduce:animate-none" />
                ) : (
                  <PdfFileIcon className="size-5" />
                )}
                {phase === "finalizing" ? "Converting…" : "Convert to PDF"}
              </Button>
            </div>
          )}
        </>
      )}

      {phase === "completed" && job && file && downloadUrl && (
        <>
          <PowerPointToPdfResult
            fileName={buildOutputFileName(file.name, job.partial)}
            pages={job.outputPages ?? 0}
            bytes={job.outputBytes ?? 0}
            downloadUrl={downloadUrl}
            onReset={removeFile}
          />
          <PowerPointToPdfPreview pdfUrl={`${downloadUrl}?inline=1&v=${state.resultVersion}`} />
        </>
      )}
    </section>
  );
}
