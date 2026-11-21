"use client";

import { cn } from "@/lib/utils";
import { SPLIT_UI } from "./split-constants";
import { SplitErrorState } from "./split-error";
import type { SplitOutput } from "./split-types";
import { formatBytes } from "./split-utils";
import { CheckCircleIcon, DownloadIcon, LoaderIcon, PdfFileIcon, ZipIcon } from "@/components/general/icons/pdf-icons";

interface SplitSuccessProps {
  outputs: readonly SplitOutput[];
  zipping: boolean;
  error: string | null;
  notice: string | null;
  onDownload: (output: SplitOutput) => void;
  onDownloadAll: () => void;
  onEditAgain: () => void;
  onSplitAnother: () => void;
}

export function SplitSuccess({
  outputs,
  zipping,
  error,
  notice,
  onDownload,
  onDownloadAll,
  onEditAgain,
  onSplitAnother,
}: SplitSuccessProps) {
  const totalPages = outputs.reduce((sum, o) => sum + o.pageCount, 0);
  const totalSize = outputs.reduce((sum, o) => sum + o.size, 0);
  const multiple = outputs.length > 1;

  return (
    <section aria-labelledby="split-success-heading" className={cn(SPLIT_UI.card, "space-y-5 p-4 sm:p-6")}>
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CheckCircleIcon className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="split-success-heading" className="text-lg font-bold text-foreground">
            Your PDFs are ready
          </h2>
          <p className="text-sm text-muted-foreground">
            {outputs.length} {outputs.length === 1 ? "file" : "files"} · {totalPages} {totalPages === 1 ? "page" : "pages"} · {formatBytes(totalSize)}
          </p>
        </div>
        {multiple ? (
          <button type="button" onClick={onDownloadAll} disabled={zipping} className={SPLIT_UI.primaryButton}>
            {zipping ? <LoaderIcon className="size-5 animate-spin motion-reduce:animate-none" /> : <ZipIcon className="size-5" />}
            {zipping ? "Creating ZIP…" : "Download All as ZIP"}
          </button>
        ) : (
          <button type="button" onClick={() => onDownload(outputs[0])} className={SPLIT_UI.primaryButton}>
            <DownloadIcon className="size-5" />
            Download PDF
          </button>
        )}
      </div>

      {error ? <SplitErrorState message={error} /> : null}

      {notice ? (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2.5 text-sm font-medium text-foreground">
          <CheckCircleIcon className="size-4 shrink-0 text-primary" />
          {notice}
        </p>
      ) : null}

      {multiple ? (
        <ul className="max-h-80 divide-y divide-border overflow-y-auto rounded-xl border border-border">
          {outputs.map((output) => (
            <li key={output.id} className="flex items-center gap-3 px-3 py-2.5">
              <PdfFileIcon className="size-5 shrink-0 text-destructive" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{output.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {output.label} · {formatBytes(output.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDownload(output)}
                aria-label={`Download ${output.filename}`}
                className={SPLIT_UI.textButton}
              >
                <DownloadIcon className="size-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onEditAgain} className={SPLIT_UI.secondaryButton}>
          Change split options
        </button>
        <button type="button" onClick={onSplitAnother} className={SPLIT_UI.secondaryButton}>
          Split another PDF
        </button>
      </div>
    </section>
  );
}