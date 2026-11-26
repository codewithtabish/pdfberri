"use client";

import { Button } from "@/components/ui/button";
import { CheckCircleIcon, DownloadIcon, RefreshIcon } from "@/components/general/icons/pdf-icons";
import type { ConversionSummary } from "./pdf-to-powerpoint-types";
import { formatBytes } from "./pdf-to-powerpoint-utils";

interface Props {
  summary: ConversionSummary;
  downloadUrl: string;
  onReset: () => void;
}

export function PdfToPowerpointResult({ summary, downloadUrl, onReset }: Props) {
  const editableMode = summary.mode === "editable";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <CheckCircleIcon className="size-10 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="text-base font-bold text-foreground">Your PowerPoint is ready</p>
            <p className="truncate text-xs text-muted-foreground">
              {summary.fileName} · {summary.slideCount} {summary.slideCount === 1 ? "slide" : "slides"} ·{" "}
              {formatBytes(summary.sizeBytes)} · {editableMode ? "Editable mode" : "High-Fidelity mode"}
            </p>
            {editableMode && (
              <p className="text-xs text-muted-foreground">
                {summary.editableSlides} editable · {summary.imageSlides} image fallback
                {summary.imageSlides === 1 ? "" : "s"} (not editable)
              </p>
            )}
            {!editableMode && (
              <p className="text-xs text-muted-foreground">
                Each slide is a page image. Text and shapes inside it are not editable.
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <a href={downloadUrl} download={summary.fileName}>
              <DownloadIcon className="size-4" />
              Download PowerPoint
            </a>
          </Button>
          <Button variant="outline" onClick={onReset}>
            <RefreshIcon className="size-4" />
            Convert another PDF
          </Button>
        </div>
      </div>

      {summary.warnings.length > 0 && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer font-semibold text-foreground">
            {summary.warnings.length} note{summary.warnings.length === 1 ? "" : "s"} about this conversion
          </summary>
          <ul className="mt-2 flex max-h-48 flex-col gap-1 overflow-y-auto">
            {summary.warnings.map((warning, index) => (
              <li key={`${warning.pageNumber ?? "all"}-${index}`}>
                {warning.pageNumber ? `Page ${warning.pageNumber}: ` : ""}
                {warning.message}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
