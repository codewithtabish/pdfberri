import { LoaderIcon } from "@/components/general/icons/pdf-icons";
import { SPLIT_UI } from "./split-constants";
import type { SplitProgress, SplitStage } from "./split-types";

const STAGE_COPY: Record<SplitStage, { title: string; description: string }> = {
  preparing: { title: "Preparing your document…", description: "Reading your PDF on this device." },
  processing: { title: "Splitting your PDF…", description: "Copying pages into new PDF files." },
  finalizing: { title: "Preparing downloads…", description: "Almost done." },
};

interface SplitProgressProps {
  progress: SplitProgress | null;
  onCancel: () => void;
}

export function SplitProgressPanel({ progress, onCancel }: SplitProgressProps) {
  const stage = progress?.stage ?? "preparing";
  const copy = STAGE_COPY[stage];
  const measurable = stage === "processing" && progress && progress.total > 0;
  const percent = measurable ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl bg-primary/5 p-4 ring-1 ring-primary/10">
      <LoaderIcon className="size-9 shrink-0 animate-spin text-primary motion-reduce:animate-none" />
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <p className="text-base font-bold text-foreground">{copy.title}</p>
          <p className="text-sm text-muted-foreground">
            {measurable ? `${progress.completed} of ${progress.total} files created.` : copy.description}
          </p>
        </div>
        {measurable ? (
          <div
            role="progressbar"
            aria-label="Splitting progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="h-1.5 overflow-hidden rounded-full bg-primary/15"
          >
            <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${percent}%` }} />
          </div>
        ) : null}
      </div>
      <button type="button" onClick={onCancel} className={SPLIT_UI.secondaryButton}>
        Cancel
      </button>
    </div>
  );
}
