import { CheckIcon, LoaderIcon } from "@/components/general/icons/pdf-icons";
import { PROCESSING_STAGES } from "./powerpoint-to-pdf-constants";
import type { Phase } from "./use-powerpoint-to-pdf";
import type { PptJobState } from "./powerpoint-to-pdf-types";

interface Props {
  phase: Phase;
  uploadPercent: number;
  jobState: PptJobState | null;
}

export function PowerPointToPdfProgress({ phase, uploadPercent, jobState }: Props) {
  const stageIndex = PROCESSING_STAGES.findIndex((stage) => stage.state === jobState);

  return (
    <div className="rounded-xl border border-border bg-card p-4" role="status" aria-live="polite">
      {phase === "uploading" ? (
        <>
          <div className="mb-2 flex justify-between text-sm font-semibold text-foreground">
            <span>Uploading presentation</span>
            <span>{uploadPercent}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={uploadPercent}
            className="h-2 overflow-hidden rounded-full bg-muted"
          >
            <div className="h-full bg-primary transition-[width]" style={{ width: `${uploadPercent}%` }} />
          </div>
        </>
      ) : (
        <ol className="flex flex-col gap-2">
          {PROCESSING_STAGES.map((stage, index) => {
            const done = stageIndex > index;
            const active = stageIndex === index || (stageIndex === -1 && index === 0);
            return (
              <li
                key={stage.state}
                className={`flex items-center gap-2 text-sm ${
                  active ? "font-semibold text-foreground" : done ? "text-muted-foreground" : "text-muted-foreground/60"
                }`}
              >
                {done ? (
                  <CheckIcon className="size-4 text-emerald-600" />
                ) : active ? (
                  <LoaderIcon className="size-4 animate-spin text-primary motion-reduce:animate-none" />
                ) : (
                  <span className="size-4 rounded-full border border-border" />
                )}
                {stage.label}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
