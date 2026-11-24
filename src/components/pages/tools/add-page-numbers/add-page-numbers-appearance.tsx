import type { FontSize, FontColor } from './add-page-numbers-types';

interface Props {
  fontSize: FontSize;
  color: FontColor;
  isBold: boolean;
  onChange: (patch: { fontSize?: FontSize; color?: FontColor; isBold?: boolean }) => void;
}

export function AddPageNumbersAppearance({ fontSize, color, isBold, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-3">Font Size</h3>
        <div className="flex gap-2">
          {(['small', 'medium', 'large'] as FontSize[]).map((s) => (
            <button key={s} onClick={() => onChange({ fontSize: s })} className={`rounded border px-4 py-1 text-sm capitalize ${fontSize === s ? 'border-primary bg-primary/5' : 'border-border'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-3">Color</h3>
        <div className="flex gap-2">
          {(['black', 'dark-grey', 'blue'] as FontColor[]).map((c) => (
            <button key={c} onClick={() => onChange({ color: c })} className={`rounded border px-4 py-1 text-sm capitalize ${color === c ? 'border-primary bg-primary/5' : 'border-border'}`}>
              {c.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm mt-2">
        <input type="checkbox" checked={isBold} onChange={(e) => onChange({ isBold: e.target.checked })} /> Bold Text
      </label>
    </div>
  );
}