import { AlertCircleIcon } from "@/components/general/icons/pdf-icons";
import type { SplitPlanResult } from "./split-types";

export function SplitOutputPreview({ plan }: { plan: SplitPlanResult | null }) {
  return (
    <section aria-labelledby="split-output-heading" className="space-y-2">
      <h3 id="split-output-heading" className="text-sm font-bold text-foreground">
        Output preview
      </h3>
      <div aria-live="polite" className="rounded-xl bg-primary/5 p-3 ring-1 ring-primary/10">
        {!plan ? null : plan.ok ? (
          <>
            <ul className="max-h-44 space-y-1.5 overflow-y-auto text-sm text-foreground">
              {plan.outputs.map((output) => (
                <li key={output.id} className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="font-semibold">{output.filename}</span>
                  <span className="text-muted-foreground">{output.label}</span>
                </li>
              ))}
            </ul>
            {plan.warning ? (
              <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                <AlertCircleIcon className="mt-0.5 size-3.5 shrink-0" />
                {plan.warning}
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{plan.error}</p>
        )}
      </div>
    </section>
  );
}
