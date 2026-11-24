import type { NumberFormat } from './add-page-numbers-types';

interface Props {
  value: NumberFormat;
  onChange: (val: NumberFormat) => void;
}

export function AddPageNumbersFormatSelector({ value, onChange }: Props) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Number Format</h3>
      <div className="flex flex-wrap gap-2">
        {(['numeric', 'page-x', 'page-x-of-y'] as NumberFormat[]).map((fmt) => (
          <button
            key={fmt}
            onClick={() => onChange(fmt)}
            className={`rounded border px-4 py-2 text-sm ${value === fmt ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-accent'}`}
          >
            {fmt === 'numeric' ? '1, 2, 3' : fmt === 'page-x' ? 'Page 1' : 'Page 1 of 10'}
          </button>
        ))}
      </div>
    </div>
  );
}