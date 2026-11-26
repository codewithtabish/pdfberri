'use client';

import { SettingsIcon } from '@/components/general/icons/pdf-icons';
import type {
  ConversionSettings,
  MarginPreset,
  OrientationSetting,
  PaperSize,
  ScalingMode,
} from './excel-to-pdf-types';

interface Props {
  settings: ConversionSettings;
  disabled: boolean;
  hasPrintSettings: boolean;
  hiddenRowTotal: number;
  hiddenColTotal: number;
  hasHiddenSheets: boolean;
  onChange: (patch: Partial<ConversionSettings>) => void;
}

interface SegProps<T extends string> {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  disabled: boolean;
  onChange: (v: T) => void;
}

function Segmented<T extends string>({ label, value, options, disabled, onChange }: SegProps<T>) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
              value === o.value ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface CheckProps {
  label: string;
  checked: boolean;
  disabled: boolean;
  hint?: string;
  onChange: (v: boolean) => void;
}

function Check({ label, checked, disabled, hint, onChange }: CheckProps) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm">
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 accent-primary"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <span className="text-foreground">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
    </label>
  );
}

function NumberField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  disabled: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
      {label}
      <input
        type="number"
        min={0}
        value={Number.isFinite(value) ? value : ''}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-24 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
      />
    </label>
  );
}

export function ExcelSettings({
  settings,
  disabled,
  hasPrintSettings,
  hiddenRowTotal,
  hiddenColTotal,
  hasHiddenSheets,
  onChange,
}: Props) {
  const paperOptions: Array<{ value: PaperSize; label: string }> = [
    { value: 'a4', label: 'A4' },
    { value: 'letter', label: 'Letter' },
    { value: 'legal', label: 'Legal' },
    { value: 'custom', label: 'Custom' },
  ];
  const orientationOptions: Array<{ value: OrientationSetting; label: string }> = [
    { value: 'auto', label: 'Auto' },
    { value: 'portrait', label: 'Portrait' },
    { value: 'landscape', label: 'Landscape' },
  ];
  const marginOptions: Array<{ value: MarginPreset; label: string }> = [
    { value: 'normal', label: 'Normal' },
    { value: 'narrow', label: 'Narrow' },
    { value: 'wide', label: 'Wide' },
    { value: 'custom', label: 'Custom' },
  ];
  const scalingOptions: Array<{ value: ScalingMode; label: string }> = [
    { value: 'fit-width', label: 'Fit to width' },
    { value: 'fit-page', label: 'Fit to one page' },
    { value: 'actual', label: 'Actual size' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 font-bold text-foreground">
        <SettingsIcon className="h-5 w-5 text-primary" />
        Conversion settings
      </div>

      <Segmented label="Paper size" value={settings.paper} options={paperOptions} disabled={disabled} onChange={(v) => onChange({ paper: v })} />
      {settings.paper === 'custom' && (
        <div className="flex gap-3">
          <NumberField label="Width (mm)" value={settings.customWidthMm} disabled={disabled} onChange={(v) => onChange({ customWidthMm: v })} />
          <NumberField label="Height (mm)" value={settings.customHeightMm} disabled={disabled} onChange={(v) => onChange({ customHeightMm: v })} />
        </div>
      )}

      <Segmented
        label="Orientation"
        value={settings.orientation}
        options={orientationOptions}
        disabled={disabled}
        onChange={(v) => onChange({ orientation: v })}
      />
      <Segmented label="Margins" value={settings.margins} options={marginOptions} disabled={disabled} onChange={(v) => onChange({ margins: v })} />
      {settings.margins === 'custom' && (
        <NumberField label="Margin (mm)" value={settings.customMarginMm} disabled={disabled} onChange={(v) => onChange({ customMarginMm: v })} />
      )}

      <Segmented label="Scaling" value={settings.scaling} options={scalingOptions} disabled={disabled} onChange={(v) => onChange({ scaling: v })} />

      <div className="flex flex-col gap-2.5 border-t border-border pt-4">
        <Check label="Show gridlines" checked={settings.showGridlines} disabled={disabled} onChange={(v) => onChange({ showGridlines: v })} />
        <Check
          label="Repeat first row on every page"
          checked={settings.repeatHeaderRow}
          disabled={disabled}
          onChange={(v) => onChange({ repeatHeaderRow: v })}
        />
        <Check label="Page numbers" checked={settings.pageNumbers} disabled={disabled} onChange={(v) => onChange({ pageNumbers: v })} />
        <Check
          label="Worksheet name at top of each page"
          checked={settings.sheetNameHeader}
          disabled={disabled}
          onChange={(v) => onChange({ sheetNameHeader: v })}
        />
        {hasPrintSettings && (
          <Check
            label="Use workbook print area and orientation"
            checked={settings.useWorkbookPrintSettings}
            disabled={disabled}
            hint="Uses the print area and page orientation saved in the workbook. Orientation applies when set to Auto."
            onChange={(v) => onChange({ useWorkbookPrintSettings: v })}
          />
        )}
      </div>

      {(hasHiddenSheets || hiddenRowTotal > 0 || hiddenColTotal > 0) && (
        <div className="flex flex-col gap-2.5 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            Hidden content can contain private or sensitive information. Only include it if you want it in the PDF.
          </p>
          {hasHiddenSheets && (
            <Check
              label="Include hidden worksheets"
              checked={settings.includeHiddenSheets}
              disabled={disabled}
              onChange={(v) => onChange({ includeHiddenSheets: v })}
            />
          )}
          {hiddenRowTotal > 0 && (
            <Check
              label={`Include hidden rows (${hiddenRowTotal})`}
              checked={settings.includeHiddenRows}
              disabled={disabled}
              onChange={(v) => onChange({ includeHiddenRows: v })}
            />
          )}
          {hiddenColTotal > 0 && (
            <Check
              label={`Include hidden columns (${hiddenColTotal})`}
              checked={settings.includeHiddenColumns}
              disabled={disabled}
              onChange={(v) => onChange({ includeHiddenColumns: v })}
            />
          )}
        </div>
      )}
    </div>
  );
}