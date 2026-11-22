// src/components/pages/tools/pdf-to-word/pdf-to-word-features.tsx

import { BENEFITS } from "./pdf-to-word-constants";

export function PdfToWordFeatures() {
  return (
    <section aria-labelledby="pdf-to-word-features" className="space-y-6">
      <h2
        id="pdf-to-word-features"
        className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl"
      >
        A simpler way to work with PDF documents
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map(({ title, description, Icon }) => (
          <li
            key={title}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <h3 className="font-bold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}