"use client";

import { InfoIcon, SlidersIcon } from "@/components/general/icons/pdf-icons";
import { PERMISSION_OPTIONS } from "./protect-config";
import type { ProtectPdfPermissions } from "./protect-types";

interface ProtectPermissionsProps {
  permissions: ProtectPdfPermissions;
  disabled: boolean;
  onToggle: (key: keyof ProtectPdfPermissions) => void;
}

export function ProtectPermissions({ permissions, disabled, onToggle }: ProtectPermissionsProps) {
  return (
    <fieldset disabled={disabled} className="flex min-w-0 flex-col gap-3">
      <legend className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
        <SlidersIcon className="size-4" />
        Permissions <span className="font-medium text-muted-foreground">(Optional)</span>
      </legend>

      <div className="grid gap-2 sm:grid-cols-2">
        {PERMISSION_OPTIONS.map((option) => (
          <label
            key={option.key}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm text-foreground transition-colors hover:border-primary/40 has-checked:border-primary/40 has-checked:bg-primary/5 has-disabled:cursor-not-allowed has-disabled:opacity-60 motion-reduce:transition-none"
          >
            <input
              type="checkbox"
              checked={permissions[option.key]}
              onChange={() => onToggle(option.key)}
              className="size-4 shrink-0 accent-primary"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>

      <p className="flex items-start gap-2 rounded-xl bg-primary/5 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
        <InfoIcon className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>
          PDF permission restrictions are not equivalent to strong encryption and may not be enforced by every PDF
          viewer. PDFBerri sets a random owner password and does not keep it.
        </span>
      </p>
    </fieldset>
  );
}