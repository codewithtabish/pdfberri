import type { PagePosition } from './add-page-numbers-types';

interface Props {
  value: PagePosition;
  onChange: (val: PagePosition) => void;
}

const POSITIONS: PagePosition[] = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];

export function AddPageNumbersPositionSelector({ value, onChange }: Props) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Position</h3>
      <div className="grid grid-cols-3 gap-2">
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            onClick={() => onChange(pos)}
            className={`rounded border p-3 text-xs capitalize ${value === pos ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-accent'}`}
          >
            {pos.replace('-', ' ')}
          </button>
        ))}
      </div>
    </div>
  );
}