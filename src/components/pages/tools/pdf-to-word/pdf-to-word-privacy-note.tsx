// src/components/pages/tools/pdf-to-word/pdf-to-word-privacy-note.tsx

import type { ReactNode } from "react";
import { LockIcon } from "@/components/general/icons/pdf-icons";

export function PdfToWordPrivacyNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
      <LockIcon className="size-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}