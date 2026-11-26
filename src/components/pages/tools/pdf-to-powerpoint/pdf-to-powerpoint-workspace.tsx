"use client";

import { Button } from "@/components/ui/button";
import { PowerpointIcon } from "@/components/general/icons/pdf-icons";
import { PdfToPowerpointError } from "./pdf-to-powerpoint-error";
import { PdfToPowerpointFileCard } from "./pdf-to-powerpoint-file-card";
import { PdfToPowerpointModeSelector } from "./pdf-to-powerpoint-mode-selector";
import { PdfToPowerpointPageSelector } from "./pdf-to-powerpoint-page-selector";
import { PdfToPowerpointPreview } from "./pdf-to-powerpoint-preview";
import { PdfToPowerpointProgress } from "./pdf-to-powerpoint-progress";
import { PdfToPowerpointResult } from "./pdf-to-powerpoint-result";
import { PdfToPowerpointSettings } from "./pdf-to-powerpoint-settings";
import { PdfToPowerpointUploadZone } from "./pdf-to-powerpoint-upload-zone";
import { usePdfToPowerpoint } from "./use-pdf-to-powerpoint";

export function PdfToPowerpointWorkspace() {
  const w = usePdfToPowerpoint();
  const converting = w.status === "converting";
  const inspecting = w.status === "inspecting";

  return (
    <div className="flex flex-col gap-6">
      {w.error && <PdfToPowerpointError message={w.error} onDismiss={w.dismissError} />}

      {!w.file || !w.doc ? (
        <PdfToPowerpointUploadZone onSelect={w.loadFile} loading={inspecting} />
      ) : (
        <>
          <PdfToPowerpointFileCard
            file={w.file}
            pageCount={w.doc.numPages}
            disabled={converting || inspecting}
            onReplace={w.loadFile}
            onRemove={w.reset}
          />

          <section className="flex flex-col gap-3" aria-label="Conversion mode">
            <h2 className="text-sm font-bold text-foreground">Conversion mode</h2>
            <PdfToPowerpointModeSelector
              value={w.settings.mode}
              disabled={converting}
              onChange={(mode) => w.updateSettings({ mode })}
            />
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <PdfToPowerpointSettings
                settings={w.settings}
                disabled={converting}
                onChange={w.updateSettings}
              />
              <PdfToPowerpointPageSelector
                doc={w.doc}
                selected={w.selected}
                rangeText={w.rangeText}
                rangeError={w.rangeError}
                disabled={converting}
                onToggle={w.togglePage}
                onSelectAll={w.selectAll}
                onClear={w.clearSelection}
                onRange={w.applyRange}
              />
            </div>
            <PdfToPowerpointPreview doc={w.doc} pages={w.selected} settings={w.settings} />
          </div>

          {converting ? (
            <PdfToPowerpointProgress progress={w.progress} onCancel={w.cancel} />
          ) : w.status === "done" && w.summary && w.downloadUrl ? (
            <PdfToPowerpointResult summary={w.summary} downloadUrl={w.downloadUrl} onReset={w.reset} />
          ) : (
            <div className="flex justify-center">
              <Button size="lg" disabled={w.selected.length === 0} onClick={() => void w.convert()}>
                <PowerpointIcon className="size-5" />
                Convert to PowerPoint
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
