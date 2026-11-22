"use client";

import { formatBytes } from "./pdf-to-jpg-utils";
import { DownloadIcon, ZipIcon } from "@/components/general/icons/pdf-icons";
import type { ConversionResult } from "./pdf-to-jpg-types";

interface ResultsProps {
  result: ConversionResult;
  onReset: () => void;
}

export function PdfToJpgResults({ result, onReset }: ResultsProps) {
  const isSingle = result.images.length === 1;

  return (
    <div className="space-y-4 rounded-2xl border border-chart-2/30 bg-chart-2/10 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Your images are ready!</h2>
          <p className="text-sm text-muted-foreground">
            {result.images.length} {result.images.length === 1 ? "image" : "images"} generated successfully.
          </p>
        </div>
        <div className="flex gap-2">
          {isSingle ? (
            <a
              href={URL.createObjectURL(result.images[0].blob)}
              download={result.images[0].filename}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <DownloadIcon className="size-4" /> Download JPG
            </a>
          ) : (
            <a
              href={URL.createObjectURL(result.zipBlob!)}
              download={result.zipFilename}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <ZipIcon className="size-4" /> Download All as ZIP
            </a>
          )}
          <button
            onClick={onReset}
            className="inline-flex h-11 items-center rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-muted"
          >
            Convert Another
          </button>
        </div>
      </div>

      {!isSingle && (
        <ul className="max-h-60 overflow-y-auto divide-y divide-border rounded-xl border border-border bg-card">
          {result.images.map((img) => (
            <li key={img.pageNumber} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-semibold">{img.filename}</p>
                <p className="text-xs text-muted-foreground">{img.width}×{img.height} • {formatBytes(img.size)}</p>
              </div>
              <a
                href={URL.createObjectURL(img.blob)}
                download={img.filename}
                className="text-primary hover:underline text-sm font-medium"
              >
                Download
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}