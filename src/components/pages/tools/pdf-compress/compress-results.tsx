"use client";

import { CompressComparison } from "./compress-comparison";
import type { CompressResult } from "./compress-types";
import { downloadBlob } from "./compress-download";
import { CheckCircleIcon, DownloadIcon, RefreshIcon } from "@/components/general/icons/pdf-icons";

interface CompressResultsProps {
  result: CompressResult;
  notice: string | null;
  onTryAgain: () => void;
  onStartOver: () => void;
}

export function CompressResults({ result, notice, onTryAgain, onStartOver }: CompressResultsProps) {
  const saved = result.bytesSaved > 0;
  const headline = saved
    ? "Your PDF is ready!"
    : result.reductionPercentage < -1
      ? "This PDF couldn't be made smaller"
      : "This PDF is already well optimized";

  const subline = saved
    ? "Your file has been compressed successfully."
    : result.reductionPercentage < -1
      ? "The optimized output is larger than the original. Keep your original, or try another mode."
      : "Structural optimization didn't reduce this file meaningfully.";

  return (
    <section className={`space-y-4 rounded-2xl border p-4 sm:p-6 ${saved ? "border-chart-2/30 bg-chart-2/10" : "border-border bg-card"}`}>
      <div className="flex flex-wrap items-center gap-4">
        <span className={`flex size-12 shrink-0 items-center justify-center rounded-full ${saved ? "bg-chart-2 text-white" : "bg-primary/10 text-primary"}`}>
          <CheckCircleIcon className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-foreground">{headline}</h2>
          <p className="text-sm text-muted-foreground">{subline}</p>
        </div>
      </div>

      <CompressComparison result={result} />

      {notice ? (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2.5 text-sm font-medium text-foreground">
          <CheckCircleIcon className="size-4 shrink-0 text-primary" />
          {notice}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => downloadBlob(result.blob, result.filename)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <DownloadIcon className="size-4" />
          Download Compressed PDF
        </button>
        <button
          type="button"
          onClick={onTryAgain}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-primary/40 bg-card px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RefreshIcon className="size-4" />
          Try different settings
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Compress another PDF
        </button>
      </div>
    </section>
  );
}