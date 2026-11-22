// src/components/pages/tools/word-to-pdf/word-to-pdf-features.tsx

import { CheckIcon } from "@/components/general/icons/pdf-icons";

const FEATURES = [
  "DOCX converted privately in your browser",
  "Permission requested before any upload",
  "PDF checked before it’s offered for download",
  "Page size and image quality options",
  "Clear messages if a file can’t be converted",
  "Works in modern desktop and mobile browsers",
] as const;

export function WordToPdfFeatures() {
  return (
    <section
      aria-labelledby="word-to-pdf-features-heading"
      className="space-y-4 rounded-2xl border border-border bg-card p-5"
    >
      <h2 id="word-to-pdf-features-heading" className="text-lg font-bold tracking-tight">
        Why use PDFBerri Word to PDF?
      </h2>
      <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            {feature}
          </li>
        ))}
      </ul>
    </section>
  );
}
