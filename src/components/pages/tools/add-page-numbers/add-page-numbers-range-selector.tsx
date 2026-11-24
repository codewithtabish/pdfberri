interface Props {
  type: 'all' | 'custom';
  customRange: string;
  onChangeType: (type: 'all' | 'custom') => void;
  onChangeRange: (range: string) => void;
}

export function AddPageNumbersRangeSelector({ type, customRange, onChangeType, onChangeRange }: Props) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Page Range</h3>
      <div className="flex gap-4 mb-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" checked={type === 'all'} onChange={() => onChangeType('all')} /> All pages
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" checked={type === 'custom'} onChange={() => onChangeType('custom')} /> Custom range
        </label>
      </div>
      {type === 'custom' && (
        <input
          type="text"
          placeholder="e.g. 1-5, 8, 10-12"
          value={customRange}
          onChange={(e) => onChangeRange(e.target.value)}
          className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
        />
      )}
    </div>
  );
}