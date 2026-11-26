"use client";

import { cn } from "@/lib/utils";
import { QUALITY_LABELS } from "./pdf-to-powerpoint-constants";
import type {
  ConversionSettings,
  FitMode,
  QualityOption,
  SlideSizeOption,
  VectorPolicy,
} from "./pdf-to-powerpoint-types";

interface Props {
  settings: ConversionSettings;
  disabled: boolean;
  onChange: (patch: Partial<ConversionSettings>) => void;
}

interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
  disabled?: boolean;
}

function OptionGroup<T extends string>({
  label,
  value,
  options,
  disabled,
  onSelect,
}: {
  label: string;
  value: T;
  options: Option<T>[];
  disabled: boolean;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-foreground">{label}</span>
      <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-lg border border-border bg-muted p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            disabled={disabled || option.disabled}
            onClick={() => onSelect(option.value)}
            className={cn(
              "rounded-md px-2 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              value === option.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
            {option.hint && <span className="block text-[10px] font-normal opacity-80">{option.hint}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PdfToPowerpointSettings({ settings, disabled, onChange }: Props) {
  const editable = settings.mode === "editable";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4">
      <h3 className="text-sm font-bold text-foreground">Slide settings</h3>

      <OptionGroup<SlideSizeOption>
        label="Slide size"
        value={settings.slideSize}
        disabled={disabled}
        onSelect={(slideSize) => onChange({ slideSize })}
        options={[
          { value: "16:9", label: "16:9", hint: "Widescreen" },
          { value: "4:3", label: "4:3", hint: "Standard" },
          { value: "match", label: "Match PDF", hint: "First page" },
        ]}
      />

      <OptionGroup<FitMode>
        label="Page fit"
        value={settings.fit}
        disabled={disabled}
        onSelect={(fit) => onChange({ fit })}
        options={[
          { value: "contain", label: "Fit inside", hint: "No cropping" },
          { value: "cover", label: "Fill slide", hint: "Crops edges", disabled: editable },
        ]}
      />

      <OptionGroup<QualityOption>
        label="Image quality"
        value={settings.quality}
        disabled={disabled}
        onSelect={(quality) => onChange({ quality })}
        options={(Object.keys(QUALITY_LABELS) as QualityOption[]).map((key) => ({
          value: key,
          label: QUALITY_LABELS[key].label,
          hint: QUALITY_LABELS[key].hint,
        }))}
      />

      {editable && (
        <OptionGroup<VectorPolicy>
          label="Pages with vector graphics"
          value={settings.vectorPolicy}
          disabled={disabled}
          onSelect={(vectorPolicy) => onChange({ vectorPolicy })}
          options={[
            { value: "fallback", label: "Use page image", hint: "Not editable" },
            { value: "text-only", label: "Keep text only", hint: "Graphics omitted" },
          ]}
        />
      )}

      <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
        <input
          type="checkbox"
          className="size-4 accent-primary"
          checked={settings.addSlideNumbers}
          disabled={disabled}
          onChange={(e) => onChange({ addSlideNumbers: e.target.checked })}
        />
        Add slide numbers
      </label>

      <p className="text-xs text-muted-foreground">
        Pages always keep their proportions. With a fixed size, portrait pages are centered with empty
        margins on the sides. Mixed page sizes are fitted into the slide size set by the first selected page.
      </p>
    </div>
  );
}
