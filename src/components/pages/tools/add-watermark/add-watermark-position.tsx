import type { Position } from './add-watermark-types';

export function AddWatermarkPosition({ position, onChange }: { position: Position, onChange: (p: Position) => void }) {
  const positions: Position[] = ['top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'];
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">Position</h3>
      <div className="grid grid-cols-3 gap-2">
        {positions.map(pos => (
          <button key={pos} onClick={() => onChange(pos)} className={`border p-2 text-xs rounded capitalize ${position === pos ? 'border-primary bg-primary/10' : ''}`}>
            {pos.replace('-', ' ')}
          </button>
        ))}
      </div>
    </div>
  );
}