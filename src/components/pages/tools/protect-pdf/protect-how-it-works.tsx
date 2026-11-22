import type { ComponentType } from "react";
import { DownloadIcon, KeyIcon, ProtectIcon, UploadIcon } from "@/components/general/icons/pdf-icons";
import { HOW_STEPS } from "./protect-config";
import { Reveal } from "./protect-motion";

type StepTitle = (typeof HOW_STEPS)[number]["title"];

const STEP_ICONS: Record<StepTitle, ComponentType<{ className?: string }>> = {
  "Upload your PDF": UploadIcon,
  "Create a strong password": KeyIcon,
  "Apply password protection": ProtectIcon,
  "Download your protected document": DownloadIcon,
};

export function ProtectHowItWorks() {
  return (
    <Reveal className="h-full" delay={0.08}>
      <section
        aria-labelledby="protect-how-heading"
        className="flex h-full flex-col gap-5 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6"
      >
        <h2 id="protect-how-heading" className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
          How to protect a PDF
        </h2>

        <ol className="grid gap-3 sm:grid-cols-2">
          {HOW_STEPS.map((step, index) => {
            const Icon = STEP_ICONS[step.title];
            return (
              <li key={step.title} className="flex flex-col gap-2 rounded-2xl bg-primary/5 p-4">
                <span className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <Icon className="size-5 text-primary" />
                </span>
                <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{step.description}</p>
              </li>
            );
          })}
        </ol>
      </section>
    </Reveal>
  );
}