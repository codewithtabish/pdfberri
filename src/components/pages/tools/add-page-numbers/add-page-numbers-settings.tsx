import { AddPageNumbersPositionSelector } from './add-page-numbers-position-selector';
import { AddPageNumbersFormatSelector } from './add-page-numbers-format-selector';
import { AddPageNumbersRangeSelector } from './add-page-numbers-range-selector';
import { AddPageNumbersAppearance } from './add-page-numbers-appearance';
import type { NumberingConfig } from './add-page-numbers-types';

interface Props {
  config: NumberingConfig;
  onChange: (config: NumberingConfig) => void;
  onGenerate: () => void;
  isProcessing: boolean;
  error: string | null;
}

export function AddPageNumbersSettings({ config, onChange, onGenerate, isProcessing, error }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <AddPageNumbersPositionSelector value={config.position} onChange={(position) => onChange({ ...config, position })} />
      <AddPageNumbersFormatSelector value={config.format} onChange={(format) => onChange({ ...config, format })} />
      
      <div>
        <h3 className="text-sm font-semibold mb-3">Starting Number</h3>
        <input
          type="number" min="1"
          value={config.startNumber}
          onChange={(e) => onChange({ ...config, startNumber: parseInt(e.target.value) || 1 })}
          className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      <AddPageNumbersRangeSelector
        type={config.rangeType}
        customRange={config.customRange}
        onChangeType={(rangeType) => onChange({ ...config, rangeType })}
        onChangeRange={(customRange) => onChange({ ...config, customRange })}
      />

      <AddPageNumbersAppearance
        fontSize={config.fontSize}
        color={config.color}
        isBold={config.isBold}
        onChange={(patch) => onChange({ ...config, ...patch })}
      />

      <button
        onClick={onGenerate}
        disabled={isProcessing}
        className="mt-2 w-full rounded bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isProcessing ? 'Adding Page Numbers...' : 'Add Page Numbers'}
      </button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}