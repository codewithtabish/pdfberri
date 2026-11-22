"use client";

import { AlertCircleIcon } from "@/components/general/icons/pdf-icons";
import { ProtectButton } from "./protect-button";
import { ERROR_MESSAGES } from "./protect-config";
import type { ProtectPdfErrorCode } from "./protect-types";

interface ProtectErrorProps {
  code: ProtectPdfErrorCode;
  dismissLabel: string;
  onDismiss: () => void;
}

export function ProtectError({ code, dismissLabel, onDismiss }: ProtectErrorProps) {
  const message = ERROR_MESSAGES[code];
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <AlertCircleIcon className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-bold text-foreground">{message.title}</p>
          <p className="text-sm text-muted-foreground">{message.description}</p>
        </div>
      </div>
      <ProtectButton variant="outline" onClick={onDismiss} className="w-full sm:w-auto">
        {dismissLabel}
      </ProtectButton>
    </div>
  );
}