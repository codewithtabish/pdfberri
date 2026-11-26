"use client";

import { cn } from "@/lib/utils";
import { EditIcon, ImageIcon, InfoIcon } from "@/components/general/icons/pdf-icons";
import type { ConversionMode } from "./pdf-to-powerpoint-types";

interface Props {
  value: ConversionMode;
  disabled: boolean;
  onChange: (mode: ConversionMode) => void;
}

const MODES = [
  {
    id: "editable" as const,
    title: "Editable PowerPoint",
    body: "Rebuilds text and embedded images as separate PowerPoint objects you can edit.",
    note: "Pages with vector graphics, scans or unsupported content become non-editable image slides, and each one is reported.",
    Icon: EditIcon,
  },
  {
    id: "high-fidelity" as const,
    title: "High-Fidelity Slides",
    body: "Places each page as a high-quality image on its own slide, so it looks like the PDF.",
    note: "The page content is a single image, not editable text or shapes.",
    Icon: ImageIcon,
  },
];

export function PdfToPowerpointModeSelector({ value, disabled, onChange }: Props) {
  return (
    <fieldset disabled={disabled} className="grid gap-3 md:grid-cols-2">
      <legend className="sr-only">Conversion mode</legend>
      {MODES.map(({ id, title, body, note, Icon }) => {
        const active = value === id;
        return (
          <label
            key={id}
            className={cn(
              "flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors",
              active ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40",
            )}
          >
            <input
              type="radio"
              name="conversion-mode"
              className="mt-1 size-4 shrink-0 accent-primary"
              checked={active}
              onChange={() => onChange(id)}
            />
            <Icon className="size-8 shrink-0 text-primary" />
            <span className="flex flex-col gap-1">
              <span className="text-sm font-bold text-foreground">{title}</span>
              <span className="text-xs text-muted-foreground">{body}</span>
              <span className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
                {note}
              </span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
