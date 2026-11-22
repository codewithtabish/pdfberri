import { CheckCircleIcon, DownloadIcon, RefreshIcon } from "@/components/general/icons/pdf-icons";
import { ORIENTATION_LABELS, PAGE_SIZE_LABELS } from "./jpg-to-pdf-config";
import type { ConversionResult } from "./jpg-to-pdf-types";
import { formatBytes } from "./jpg-to-pdf-utils";

interface JpgToPdfResultsProps {
  result: ConversionResult;
  onDownload: () => void;
  onStartOver: () => void;
}

export function JpgToPdfResults({ result, onDownload, onStartOver }: JpgToPdfResultsProps) {
  const details: { label: string; value: string }[] = [
    { label: "File size", value: formatBytes(result.size) },
    { label: "Pages", value: String(result.pageCount) },
    { label: "Page size", value: PAGE_SIZE_LABELS[result.pageSize] },
    {
      label: "Orientation",
      value: result.pageSize === "fit" ? "Per image" : ORIENTATION_LABELS[result.orientation],
    },
  ];

  return (
    <section
      aria-labelledby="jpg-to-pdf-result-heading"
      className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <CheckCircleIcon className="mt-0.5 size-6 shrink-0 text-primary" />
        <div className="min-w-0">
          <h2 id="jpg-to-pdf-result-heading" className="text-lg font-bold text-foreground">
            Your PDF is ready
          </h2>
          <p role="status" className="break-all text-sm text-muted-foreground">
            {result.fileName}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {details.map((detail) => (
          <div key={detail.label} className="rounded-xl bg-card p-3 ring-1 ring-border">
            <dt className="text-xs text-muted-foreground">{detail.label}</dt>
            <dd className="mt-0.5 font-mono text-sm font-semibold text-foreground">{detail.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
        >
          <DownloadIcon className="size-5" />
          Download PDF
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RefreshIcon className="size-5" />
          Start over
        </button>
      </div>
    </section>
  );
}
