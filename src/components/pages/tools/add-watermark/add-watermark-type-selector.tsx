export function AddWatermarkTypeSelector({ type, onChange }: { type: 'text' | 'image', onChange: (t: 'text' | 'image') => void }) {
  return (
    <div className="flex rounded-lg border p-1">
      <button onClick={() => onChange('text')} className={`flex-1 py-2 text-sm rounded ${type === 'text' ? 'bg-primary text-white' : ''}`}>Text</button>
      <button onClick={() => onChange('image')} className={`flex-1 py-2 text-sm rounded ${type === 'image' ? 'bg-primary text-white' : ''}`}>Image</button>
    </div>
  );
}