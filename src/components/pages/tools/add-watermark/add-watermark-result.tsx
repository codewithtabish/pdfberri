import type { OutputState } from './add-watermark-types';

export function AddWatermarkResult({ output, onDownload, onReset }: { output: OutputState, onDownload: () => void, onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-12 text-center">
      <div className="mb-4 text-green-500">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>
      <h2 className="text-xl font-semibold mb-2">Your watermarked PDF is ready!</h2>
      <p className="text-sm text-muted-foreground mb-6">{output.filename} • {(output.size / 1024).toFixed(0)} KB • {output.pageCount} pages</p>
      <div className="flex gap-4">
        <button onClick={onDownload} className="rounded bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">Download PDF</button>
        <button onClick={onReset} className="rounded border border-border px-6 py-2.5 text-sm font-medium hover:bg-accent">Watermark Another PDF</button>
      </div>
    </div>
  );
}