"use client";

import { CheckCircleIcon, DownloadIcon, UnlockIcon } from "@/components/general/icons/pdf-icons";
import { formatFileSize, formatPageCount, triggerDownload, buildUnlockedFileName } from "./unlock-pdf.utils";

interface UnlockPdfResultProps {
  originalFile: File;
  unlockedBlob: Blob;
  pageCount: number | null;
  onReset: () => void;
  onError: (error: string) => void;
}

export function UnlockPdfResult({ originalFile, unlockedBlob, pageCount, onReset, onError }: UnlockPdfResultProps) {
  const handleDownload = () => {
    try {
      const url = URL.createObjectURL(unlockedBlob);
      const fileName = buildUnlockedFileName(originalFile.name);
      triggerDownload(url, fileName);
      // Do not revoke immediately: the browser may still be reading the blob.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      onError("download-failed");
    }
  };

  return (
    <div className="space-y-6 rounded-xl border border-green-200 bg-green-50/50 p-6 dark:border-green-900 dark:bg-green-950/20">
      <div className="flex items-start gap-3">
        <CheckCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-green-600 dark:text-green-500" />
        <div>
          <h2 className="font-semibold text-green-900 dark:text-green-300">Your PDF is Unlocked!</h2>
          <p className="text-sm text-green-700 dark:text-green-400/80">Your document is ready to download.</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 rounded-lg border border-border bg-background p-4 shadow-sm sm:flex-row">
        <div className="flex w-full items-center gap-3">
          <div className="shrink-0 rounded-lg bg-primary/10 p-2">
            <UnlockIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{buildUnlockedFileName(originalFile.name)}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatFileSize(unlockedBlob.size)}</span>
              {pageCount && (
                <>
                  <span>•</span>
                  <span>{formatPageCount(pageCount)}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
        >
          <DownloadIcon className="h-4 w-4" />
          Download Unlocked PDF
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-md bg-green-100/50 p-2 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircleIcon className="h-4 w-4" />
        The downloaded document no longer requires the original opening password.
      </div>

      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-lg border-2 border-border py-2.5 font-semibold text-foreground transition-colors hover:bg-muted"
      >
        Unlock Another PDF
      </button>
    </div>
  );
}