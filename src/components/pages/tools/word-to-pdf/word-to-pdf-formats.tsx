// src/components/pages/tools/word-to-pdf/word-to-pdf-formats.tsx

import { WordIcon } from "@/components/general/icons/pdf-icons";

export function WordToPdfFormats() {
  return (
    <section
      aria-labelledby="word-to-pdf-formats-heading"
      className="space-y-4 rounded-2xl border border-border bg-card p-5"
    >
      <h2 id="word-to-pdf-formats-heading" className="text-lg font-bold tracking-tight">
        Supported formats
      </h2>
      <ul className="space-y-3">
        <li className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <WordIcon className="size-6" />
          </span>
          <span>
            <span className="block font-mono text-sm font-bold">DOCX</span>
            <span className="block text-xs text-muted-foreground">
              Converted in your browser.
            </span>
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <WordIcon className="size-6" />
          </span>
          <span>
            <span className="block font-mono text-sm font-bold">DOC</span>
            <span className="block text-xs text-muted-foreground">
              Server conversion only, and only where it’s enabled. You’ll be
              asked before anything is uploaded.
            </span>
          </span>
        </li>
      </ul>
    </section>
  );
}
