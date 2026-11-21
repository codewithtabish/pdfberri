import { LoaderIcon } from "@/components/general/icons/pdf-icons";
import type { CompressProgress } from "./compress-types";

const STAGE_COPY = {
  preparing: { title: "Preparing your document…", desc: "Reading your PDF on this device." },
  optimizing: { title: "Optimizing your PDF…", desc: "Repackaging the document with structural compression." },
  finalizing: { title: "Preparing download…", desc: "Almost done." },
} as const;

interface CompressProgressPanelProps {
  progress: CompressProgress | null;
  onCancel: () => void;
}

export function CompressProgressPanel({ progress, onCancel }: CompressProgressPanelProps) {
  const stage = progress?.stage ?? "preparing";
  const copy = STAGE_COPY[stage];
  const measurable = progress && progress.total > 0;
  const percent = measurable ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl bg-primary/5 p-4 ring-1 ring-primary/10">
      <LoaderIcon className="size-9 shrink-0 animate-spin text-primary motion-reduce:animate-none" />
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <p className="text-base font-bold text-foreground">{copy.title}</p>
          <p className="text-sm text-muted-foreground">{copy.desc}</p>
        </div>
        {measurable ? (
          <div role="progressbar" aria-label="Compression progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="h-1.5 overflow-hidden rounded-full bg-primary/15">
            <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${percent}%` }} />
          </div>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex h-11 items-center justify-center rounded-xl border border-primary/40 bg-card px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Cancel
      </button>
    </div>
  );
}