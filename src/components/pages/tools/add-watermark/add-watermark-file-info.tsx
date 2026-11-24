export function AddWatermarkFileInfo({ filename, pageCount, onRemove }: { filename: string, pageCount: number, onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10 text-primary font-bold text-xs">PDF</div>
        <div>
          <p className="text-sm font-medium">{filename}</p>
          <p className="text-xs text-muted-foreground">{pageCount} pages</p>
        </div>
      </div>
      <button onClick={onRemove} className="text-sm text-destructive hover:underline">Remove</button>
    </div>
  );
}