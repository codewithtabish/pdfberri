// src/components/pages/tools/word-to-pdf/word-to-pdf-privacy-note.tsx

import { ProtectIcon } from "@/components/general/icons/pdf-icons";

export function WordToPdfPrivacyNote() {
  return (
    <aside
      aria-label="How your document is handled"
      className="flex items-start gap-3 rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground"
    >
      <ProtectIcon className="mt-0.5 size-5 shrink-0 text-primary" />
      <p>
        <span className="font-semibold text-foreground">How your file is handled: </span>
        DOCX documents are read and converted entirely in your browser. If a
        document needs server conversion (older .doc files, or a DOCX your
        browser can’t render), PDFBerri asks for your permission first, uses a
        temporary private folder, and deletes the files when the conversion
        finishes.
      </p>
    </aside>
  );
}
