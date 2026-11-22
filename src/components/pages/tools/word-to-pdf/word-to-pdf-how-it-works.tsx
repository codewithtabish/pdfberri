// src/components/pages/tools/word-to-pdf/word-to-pdf-how-it-works.tsx

import { ArrowRightIcon } from "@/components/general/icons/pdf-icons";

const STEPS = [
  { title: "Upload", text: "Choose or drop your Word file." },
  { title: "Convert", text: "Press Convert to PDF." },
  { title: "Download", text: "Save the PDF to your device." },
] as const;

export function WordToPdfHowItWorks() {
  return (
    <section
      aria-labelledby="word-to-pdf-how-heading"
      className="space-y-4 rounded-2xl border border-border bg-card p-5"
    >
      <h2 id="word-to-pdf-how-heading" className="text-lg font-bold tracking-tight">
        Convert Word to PDF in three simple steps
      </h2>
      <ol className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-3">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex flex-1 items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {index + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold">{step.title}</span>
              <span className="block text-xs text-muted-foreground">{step.text}</span>
            </span>
            {index < STEPS.length - 1 ? (
              <ArrowRightIcon className="ml-auto hidden size-4 shrink-0 text-muted-foreground sm:block" />
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
