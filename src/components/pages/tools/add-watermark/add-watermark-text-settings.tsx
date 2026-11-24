export function AddWatermarkTextSettings({ config, onChange }: { config: any, onChange: (c: any) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <input type="text" value={config.text} onChange={e => onChange({...config, text: e.target.value})} className="border p-2 rounded" placeholder="Watermark text" />
      <div className="flex gap-4">
        <input type="number" value={config.fontSize} onChange={e => onChange({...config, fontSize: parseInt(e.target.value)})} className="border p-2 rounded w-24" />
        <input type="color" value={config.color} onChange={e => onChange({...config, color: e.target.value})} className="h-10 w-12 rounded" />
      </div>
    </div>
  );
}