export function AddWatermarkAppearance({ config, onChange }: { config: any, onChange: (c: any) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-sm">Opacity: {Math.round(config.opacity * 100)}%</label>
        <input type="range" min="0.1" max="1" step="0.05" value={config.opacity} onChange={e => onChange({...config, opacity: parseFloat(e.target.value)})} className="w-full" />
      </div>
      <div>
         <label className="text-sm">Rotation: {config.rotation}°</label>
         <input type="range" min="-90" max="90" step="5" value={config.rotation} onChange={e => onChange({...config, rotation: parseInt(e.target.value)})} className="w-full" />
      </div>
    </div>
  );
}