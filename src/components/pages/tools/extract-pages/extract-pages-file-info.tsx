export function ExtractPagesFileInfo({ filename, fileSize, pageCount, onReset }: { filename: string, fileSize: number, pageCount: number, onReset: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4">
      <div>
        <p className="font-medium">{filename}</p>
        <p className="text-xs text-muted-foreground">{(fileSize / 1024).toFixed(0)} KB • {pageCount} pages</p>
      </div>
      <button onClick={onReset} className="text-sm text-destructive hover:underline">Remove</button>
    </div>
  );
}