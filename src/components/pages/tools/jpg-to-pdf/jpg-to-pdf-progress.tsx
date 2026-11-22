import { LoaderIcon } from "@/components/general/icons/pdf-icons";
import type { ConversionProgress } from "./jpg-to-pdf-types";

interface JpgToPdfProgressProps {
  progress: ConversionProgress;
  onCancel: () => void;
}

function describe(progress: ConversionProgress): string {
  if (progress.stage === "saving") return "Finishing your PDF";
  const verb = progress.stage === "preparing" ? "Reading" : "Added";
  return `${verb} image ${Math.max(1, progress.current)} of ${progress.total}`;
}

export function JpgToPdfProgress({ progress, onCancel }: JpgToPdfProgressProps) {
  const percent = Math.round(progress.fraction * 100);
  return (
    <section
      aria-label="Conversion progress"
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <p role="status" aria-live="polite" className="flex items-center gap-2 font-semibold text-foreground">
          <LoaderIcon className="size-5 animate-spin text-primary motion-reduce:animate-none" />
          {describe(progress)}
        </p>
        <span className="font-mono text-sm text-muted-foreground">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="PDF creation progress"
        className="h-2.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-sm text-muted-foreground">
          {progress.fileName ?? "Almost done"}
        </p>
        {progress.stage !== "saving" ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </section>
  );
}