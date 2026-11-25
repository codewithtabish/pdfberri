export function ExtractPagesToolbar({ selectedCount, total, onSelectAll, onClear, onInvert, onRangeChange }: any) {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-muted/50 p-2 rounded-lg text-sm border">
      <button onClick={onSelectAll} className="font-medium hover:text-primary">Select All</button>
      <div className="h-4 w-px bg-border" />
      <button onClick={onClear} className="font-medium hover:text-primary">Clear</button>
      <div className="h-4 w-px bg-border" />
      <button onClick={onInvert} className="font-medium hover:text-primary">Invert</button>
      <div className="ml-auto flex items-center gap-2">
        <span className="text-muted-foreground">{selectedCount} of {total} selected</span>
      </div>
      <div className="flex items-center gap-2">
        <input type="text" placeholder="e.g. 1, 3, 5-8" onChange={(e) => onRangeChange(e.target.value)} className="rounded border px-2 py-1 text-sm w-32" />
      </div>
    </div>
  );
}