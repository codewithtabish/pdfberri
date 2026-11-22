// src/components/pages/tools/word-to-pdf/word-to-pdf-result.tsx

import {
  AlertCircleIcon,
  BrowserIcon,
  CheckCircleIcon,
  DownloadIcon,
  InfoIcon,
  LoaderIcon,
  PdfFileIcon,
  PlusIcon,
  ServerIcon,
} from "@/components/general/icons/pdf-icons";

import { WordButton } from "./word-to-pdf-button";
import type { DownloadState } from "./use-word-to-pdf-workspace";
import type { EngineId } from "./word-to-pdf-types";
import { formatBytes } from "./word-to-pdf-utils";

interface WordResultProps {
  fileName: string;
  sizeBytes: number;
  pageCount: number | null;
  engine: EngineId;
  downloadState: DownloadState;
  onDownload: () => void;
  onConvertAnother: () => void;
}

export function WordResult({
  fileName,
  sizeBytes,
  pageCount,
  engine,
  downloadState,
  onDownload,
  onConvertAnother,
}: WordResultProps) {
  const isDownloading = downloadState === "downloading";
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-background/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <PdfFileIcon className="size-8" />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircleIcon className="size-4" />
              Your PDF is ready
            </p>
            <p className="truncate text-base font-bold" title={fileName}>
              {fileName}
            </p>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="font-mono">{formatBytes(sizeBytes)}</span>
              {pageCount !== null ? (
                <span className="font-mono">
                  {pageCount} {pageCount === 1 ? "page" : "pages"}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                {engine === "local" ? (
                  <BrowserIcon className="size-3.5" />
                ) : (
                  <ServerIcon className="size-3.5" />
                )}
                {engine === "local" ? "Converted in your browser" : "Converted on the server"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <WordButton
            variant="primary"
            size="lg"
            onClick={onDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <LoaderIcon className="size-5 animate-spin motion-reduce:animate-none" />
            ) : (
              <DownloadIcon className="size-5" />
            )}
            {isDownloading ? "Downloading…" : "Download PDF"}
          </WordButton>
          <WordButton size="lg" onClick={onConvertAnother}>
            <PlusIcon className="size-5" />
            Convert another
          </WordButton>
        </div>
      </div>

      {downloadState === "error" ? (
        <p
          role="alert"
          className="flex items-start gap-2 text-sm text-destructive"
        >
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
          The download couldn’t start. Check your browser’s download settings
          and press Download PDF again.
        </p>
      ) : null}

      {engine === "local" ? (
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <InfoIcon className="mt-0.5 size-4 shrink-0 text-primary" />
          Browser conversion creates image-based pages, so text in this PDF
          can’t be selected or searched. Check the layout before sharing it.
        </p>
      ) : null}
    </div>
  );
}
