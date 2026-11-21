import { MergeResult } from "./merge-types";
import { formatBytes, formatPages } from "./merge-utils";
import { Check, Download } from "lucide-react";

interface MergeSuccessProps {
  result: MergeResult;
  onMergeMore: () => void;
}

export function MergeSuccess({ result, onMergeMore }: MergeSuccessProps) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-chart-2/30 bg-chart-2/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-chart-2 text-white"
        >
          <Check className="size-6" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Your PDF is ready!
          </h2>
          <p className="mt-0.5 break-all text-sm text-foreground/65">
            {result.fileName} · {formatPages(result.pageCount)} ·{" "}
            {formatBytes(result.sizeBytes)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <a
          href={result.url}
          download={result.fileName}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Download aria-hidden="true" className="size-4" />
          Download PDF
        </a>
        <button
          type="button"
          onClick={onMergeMore}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-primary/40 bg-card px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Merge More PDFs
        </button>
      </div>
    </div>
  );
}