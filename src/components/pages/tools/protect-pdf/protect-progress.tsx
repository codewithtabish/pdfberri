"use client";

import { motion } from "framer-motion";
import { CheckIcon, LoaderIcon } from "@/components/general/icons/pdf-icons";
import { cn } from "@/lib/utils";
import { PROCESSING_STEPS } from "./protect-config";
import type { ProtectPdfStatus } from "./protect-types";

const ACTIVE_STEP: Partial<Record<ProtectPdfStatus, number>> = {
  validating: 0,
  "loading-engine": 0,
  protecting: 1,
  verifying: 2,
  completed: 3,
};

export function ProtectProgress({ status }: { status: ProtectPdfStatus }) {
  const active = ACTIVE_STEP[status] ?? 0;

  return (
    <section
      role="status"
      aria-live="polite"
      aria-label="Processing your PDF"
      className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LoaderIcon className="size-6 animate-spin motion-reduce:animate-none" />
          </span>
          <div>
            <h2 className="text-base font-bold text-foreground">Processing your PDF…</h2>
            <p className="text-xs text-muted-foreground">Everything happens on your device.</p>
          </div>
        </div>

        <ol className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
          {PROCESSING_STEPS.map((label, index) => {
            const done = index < active;
            const current = index === active;
            return (
              <li key={label} className="flex flex-col items-center gap-2 text-center">
                <motion.span
                  initial={false}
                  animate={{ scale: current ? 1.08 : 1 }}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border-2 transition-colors motion-reduce:transition-none",
                    done && "border-primary bg-primary text-primary-foreground",
                    current && "border-primary bg-card text-primary",
                    !done && !current && "border-border bg-card text-transparent"
                  )}
                >
                  {done ? (
                    <CheckIcon className="size-4" />
                  ) : current ? (
                    <LoaderIcon className="size-4 animate-spin motion-reduce:animate-none" />
                  ) : (
                    <span className="size-2 rounded-full bg-muted" />
                  )}
                </motion.span>
                <span className={cn("text-xs font-medium", current || done ? "text-foreground" : "text-muted-foreground")}>
                  {label}
                  <span className="sr-only">{done ? " (done)" : current ? " (in progress)" : " (waiting)"}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}