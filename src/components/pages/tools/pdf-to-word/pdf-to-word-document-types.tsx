// src/components/pages/tools/pdf-to-word/pdf-to-word-document-types.tsx

import { DOCUMENT_TYPES } from "./pdf-to-word-constants";

export function PdfToWordDocumentTypes() {
  return (
    <section aria-labelledby="pdf-to-word-types" className="space-y-6">
      <h2
        id="pdf-to-word-types"
        className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl"
      >
        Supported document types
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {DOCUMENT_TYPES.map(({ label, Icon }) => (
          <li
            key={label}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center text-sm font-medium"
          >
            <Icon className="size-6 text-primary" />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}