import { formatBytes, formatPercent } from "./compress-utils";
import type { CompressResult } from "./compress-types";
import { ArrowRightIcon, PdfFileIcon } from "@/components/general/icons/pdf-icons";

export function CompressComparison({ result }: { result: CompressResult }) {
  const saved = result.bytesSaved > 0;
  return (
    <div className="grid gap-3 rounded-xl border border-border bg-card p-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:p-4">
      <div className="rounded-lg bg-muted/40 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Original</p>
        <div className="mt-1 flex items-center gap-2">
          <PdfFileIcon className="size-5 text-destructive" />
          <p className="text-lg font-bold text-foreground">{formatBytes(result.originalSize)}</p>
        </div>
        <p className="text-xs text-muted-foreground">{result.pageCount} {result.pageCount === 1 ? "page" : "pages"}</p>
      </div>
      <div className="flex justify-center">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ArrowRightIcon className="size-4" />
        </span>
      </div>
      <div className={`rounded-lg p-3 ${saved ? "bg-primary/5 ring-1 ring-primary/20" : "bg-destructive/5 ring-1 ring-destructive/20"}`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Compressed</p>
        <div className="mt-1 flex items-center gap-2">
          <PdfFileIcon className="size-5 text-destructive" />
          <p className="text-lg font-bold text-foreground">{formatBytes(result.size)}</p>
        </div>
        <p className={`text-xs font-semibold ${saved ? "text-primary" : "text-destructive"}`}>
          {saved
            ? `Saved ${formatBytes(result.bytesSaved)} (${formatPercent(result.reductionPercentage)})`
            : result.reductionPercentage < -1
              ? `Grew by ${formatBytes(-result.bytesSaved)}`
              : "No meaningful change"}
        </p>
      </div>
    </div>
  );
}