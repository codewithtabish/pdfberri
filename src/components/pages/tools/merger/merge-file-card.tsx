import { memo } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  GripVertical,
  Loader2,
  X,
} from "lucide-react";
import { MergeFileItem } from "./merge-types";
import { formatBytes, formatPages } from "./merge-utils";

interface MergeFileCardProps {
  item: MergeFileItem;
  index: number;
  total: number;
  onRemove: (id: string) => void;
  onMove: (from: number, to: number) => void;
}

const iconButton =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40";

function MergeFileCardComponent({
  item,
  index,
  total,
  onRemove,
  onMove,
}: MergeFileCardProps) {
  const { file, pageCount, id } = item;

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background p-2.5 sm:gap-3 sm:p-3">
      <GripVertical
        aria-hidden="true"
        className="hidden size-5 shrink-0 cursor-grab text-foreground/40 sm:block"
      />

      <span
        aria-hidden="true"
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
      >
        {index + 1}
      </span>

      <span
        aria-hidden="true"
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
      >
        <FileText className="size-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground" title={file.name}>
          {file.name}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-foreground/65">
          {formatBytes(file.size)}
          <span aria-hidden="true">·</span>
          {pageCount === null ? (
            <span className="inline-flex items-center gap-1">
              <Loader2
                aria-hidden="true"
                className="size-3 animate-spin motion-reduce:animate-none"
              />
              Reading…
            </span>
          ) : (
            formatPages(pageCount)
          )}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          className={iconButton}
          onClick={() => onMove(index, index - 1)}
          disabled={index === 0}
          aria-label={`Move ${file.name} up`}
        >
          <ChevronUp aria-hidden="true" className="size-4" />
        </button>
        <button
          type="button"
          className={iconButton}
          onClick={() => onMove(index, index + 1)}
          disabled={index === total - 1}
          aria-label={`Move ${file.name} down`}
        >
          <ChevronDown aria-hidden="true" className="size-4" />
        </button>
        <button
          type="button"
          className={`${iconButton} text-destructive hover:bg-destructive/10 hover:text-destructive`}
          onClick={() => onRemove(id)}
          aria-label={`Remove ${file.name}`}
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}

export const MergeFileCard = memo(MergeFileCardComponent);