import { downloadBlob } from './extract-pages-download';

export function ExtractPagesResult({ output, onReset }: any) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-12 text-center">
      <h2 className="text-xl font-semibold mb-4">Extraction Complete!</h2>
      <div className="flex flex-col gap-2 w-full max-w-sm">
        {output.map((file: any, i: number) => (
          <button key={i} onClick={() => downloadBlob(file.blob, file.filename)} className="flex items-center justify-between p-3 border rounded hover:bg-accent text-sm">
            <span className="truncate">{file.filename}</span>
            <span className="text-xs text-primary font-medium">Download</span>
          </button>
        ))}
      </div>
      <button onClick={onReset} className="mt-6 text-sm text-muted-foreground hover:underline">Extract from another PDF</button>
    </div>
  );
}