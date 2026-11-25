export function RearrangePagesToolbar({ 
  selectedCount, onSelectAll, onClear, onReverse, onUndo, onRedo, canUndo, canRedo 
}: any) {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-muted/50 p-2 rounded-lg text-sm border">
      <button onClick={onSelectAll} className="font-medium hover:text-primary">Select All</button>
      <div className="h-4 w-px bg-border" />
      <button onClick={onClear} className="font-medium hover:text-primary">Clear Selection</button>
      <div className="h-4 w-px bg-border" />
      <button onClick={onReverse} className="font-medium hover:text-primary">Reverse Order</button>
      <div className="ml-auto flex items-center gap-4">
        <span className="text-muted-foreground">{selectedCount} pages selected</span>
        <div className="flex gap-1">
          <button onClick={onUndo} disabled={!canUndo} className="p-1.5 rounded hover:bg-accent disabled:opacity-50">Undo</button>
          <button onClick={onRedo} disabled={!canRedo} className="p-1.5 rounded hover:bg-accent disabled:opacity-50">Redo</button>
        </div>
      </div>
    </div>
  );
}