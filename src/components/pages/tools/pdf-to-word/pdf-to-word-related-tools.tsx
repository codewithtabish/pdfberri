// src/components/pages/tools/pdf-to-word/pdf-to-word-related-tools.tsx

import Link from "next/link";
import { RELATED_TOOLS } from "./pdf-to-word-constants";

export function PdfToWordRelatedTools() {
  return (
    <section aria-labelledby="pdf-to-word-related" className="space-y-4">
      <h2
        id="pdf-to-word-related"
        className="text-2xl font-extrabold tracking-tight"
      >
        Related PDF Tools
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {RELATED_TOOLS.map(({ name, href, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex h-full flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center text-sm font-semibold transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon className="size-6 text-primary" />
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}