import { ArrowRight, FileText, Trash2 } from "lucide-react";
import { formatBytes, formatFiles, formatPages } from "./merge-utils";

interface MergeToolbarProps {
  fileCount: number;
  totalPages: number;
  totalSize: number;
  isInspecting: boolean;
  outputName: string;
  canMerge: boolean;
  onOutputNameChange: (value: string) => void;
  onOutputNameCommit: () => void;
  onMerge: () => void;
  onClear: () => void;
}

export function MergeToolbar({
  fileCount,
  totalPages,
  totalSize,
  isInspecting,
  outputName,
  canMerge,
  onOutputNameChange,
  onOutputNameCommit,
  onMerge,
  onClear,
}: MergeToolbarProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (canMerge) onMerge();
      }}
      className="rounded-xl border border-border bg-background p-3 sm:p-4"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-foreground">
          <FileText aria-hidden="true" className="size-5 text-primary" />
          <span>{formatFiles(fileCount)}</span>
          <span aria-hidden="true" className="text-foreground/30">|</span>
          <span>{isInspecting ? "Reading pages…" : formatPages(totalPages)}</span>
          <span aria-hidden="true" className="text-foreground/30">|</span>
          <span>{formatBytes(totalSize)}</span>
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <label
              htmlFor="merge-output-name"
              className="shrink-0 text-xs font-medium text-foreground/65"
            >
              File name:
            </label>
            <input
              id="merge-output-name"
              type="text"
              value={outputName}
              maxLength={120}
              placeholder="Auto (unique name)"
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => onOutputNameChange(event.target.value)}
              onBlur={onOutputNameCommit}
              className="h-10 w-full min-w-0 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground placeholder:text-foreground/45 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:w-52"
            />
          </div>

          <button
            type="submit"
            disabled={!canMerge}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-[transform,opacity] hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Merge PDF
            <ArrowRight aria-hidden="true" className="size-4" />
          </button>

          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Clear all
          </button>
        </div>
      </div>

      <p className="mt-3 text-xs text-foreground/65">
        {fileCount < 2
          ? "Add at least two PDF files to merge."
          : "Leave the file name empty to get a unique name automatically."}
      </p>
    </form>
  );
}