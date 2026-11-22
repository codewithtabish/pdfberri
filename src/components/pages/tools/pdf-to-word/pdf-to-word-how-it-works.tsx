// src/components/pages/tools/pdf-to-word/pdf-to-word-how-it-works.tsx

import { HOW_IT_WORKS } from "./pdf-to-word-constants";

export function PdfToWordHowItWorks() {
  return (
    <section aria-labelledby="pdf-to-word-how" className="space-y-6">
      <h2
        id="pdf-to-word-how"
        className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl"
      >
        How it works
      </h2>
      <ol className="grid gap-4 md:grid-cols-3">
        {HOW_IT_WORKS.map(({ title, description, Icon }, index) => (
          <li
            key={title}
            className="flex items-start gap-4 rounded-xl border border-border bg-card p-5"
          >
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Icon className="size-8 shrink-0 text-primary" />
          </li>
        ))}
      </ol>
    </section>
  );
}