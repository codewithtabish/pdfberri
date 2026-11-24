export function AddWatermarkPageRange({ pageRange, customRange, onChange }: { pageRange: 'all' | 'custom', customRange: string, onChange: (patch: any) => void }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">Page Range</h3>
      <div className="flex gap-4 mb-2">
        <label className="flex items-center gap-2 text-sm"><input type="radio" checked={pageRange === 'all'} onChange={() => onChange({ pageRange: 'all' })} /> All pages</label>
        <label className="flex items-center gap-2 text-sm"><input type="radio" checked={pageRange === 'custom'} onChange={() => onChange({ pageRange: 'custom' })} /> Custom</label>
      </div>
      {pageRange === 'custom' && (
        <input type="text" placeholder="e.g. 1-5, 8" value={customRange} onChange={e => onChange({ customRange: e.target.value })} className="border p-2 rounded w-full text-sm" />
      )}
    </div>
  );
}