"use client";

import { Button } from "@/components/ui/button";
import { AlertCircleIcon, XIcon } from "@/components/general/icons/pdf-icons";

export function PdfToPowerpointError({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
    >
      <AlertCircleIcon className="mt-0.5 size-5 shrink-0" />
      <p className="flex-1 font-medium">{message}</p>
      <Button variant="ghost" size="icon" aria-label="Dismiss" onClick={onDismiss}>
        <XIcon className="size-4" />
      </Button>
    </div>
  );
}
