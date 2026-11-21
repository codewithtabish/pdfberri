import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MergeProgress } from "./merge-types";
import { MERGE_STAGES } from "./merge-constants";

interface MergeProgressProps {
  progress: MergeProgress | null;
  onCancel: () => void;
}

export function MergeProgressView({ progress, onCancel }: MergeProgressProps) {
  const stage = progress?.stage ?? "preparing";
  const stageIndex = MERGE_STAGES.findIndex((item) => item.id === stage);
  const stageLabel = MERGE_STAGES[stageIndex]?.label ?? "Working";

  // Only report a percentage when it reflects real work (files processed).
  const determinate = stage === "reading" || stage === "combining";
  const percent =
    determinate && progress && progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : 0;

  return (
    <div className="flex flex-col items-center px-4 py-10 text-center sm:py-14">
      <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Loader2
          aria-hidden="true"
          className="size-7 animate-spin motion-reduce:animate-none"
        />
      </span>

      <h2 className="mt-5 text-xl font-bold tracking-tight text-foreground">
        {stageLabel}…
      </h2>
      <p className="mt-1 text-sm text-foreground/65">
        {determinate && progress
          ? `File ${Math.min(progress.completed + 1, progress.total)} of ${progress.total}`
          : "This usually takes a moment. Your files stay on your device."}
      </p>

      <div
        role="progressbar"
        aria-label="Merge progress"
        aria-valuetext={stageLabel}
        aria-valuemin={determinate ? 0 : undefined}
        aria-valuemax={determinate ? 100 : undefined}
        aria-valuenow={determinate ? percent : undefined}
        className="mt-6 h-2 w-full max-w-md overflow-hidden rounded-full bg-primary/15"
      >
        <div
          className={cn(
            "h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none",
            !determinate && "w-full animate-pulse motion-reduce:animate-none",
          )}
          style={determinate ? { width: `${percent}%` } : undefined}
        />
      </div>

      <ol className="mt-6 flex flex-col gap-2 text-left text-sm">
        {MERGE_STAGES.map((item, index) => {
          const done = index < stageIndex;
          const current = index === stageIndex;
          return (
            <li
              key={item.id}
              className={cn(
                "flex items-center gap-2",
                current ? "font-semibold text-foreground" : "text-foreground/55",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "inline-flex size-5 items-center justify-center rounded-full border text-primary",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : current
                      ? "border-primary"
                      : "border-border",
                )}
              >
                {done && <Check className="size-3" />}
              </span>
              {item.label}
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        onClick={onCancel}
        className="mt-8 inline-flex h-10 items-center rounded-xl border border-border bg-background px-5 text-sm font-semibold text-foreground transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Cancel
      </button>
    </div>
  );
}