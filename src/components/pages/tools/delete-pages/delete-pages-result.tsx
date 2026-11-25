import { downloadBlob } from './delete-pages-download';

export function DeletePagesResult({ output, onReset }: any) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-12 text-center shadow-sm">
      <div className="mb-4 rounded-full bg-green-100 p-3 text-green-600">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>
      <h2 className="text-xl font-bold mb-2">Unwanted pages removed!</h2>
      <p className="text-sm text-muted-foreground mb-6">Your PDF has been updated successfully.</p>
      
      <div className="flex gap-8 mb-8 text-sm bg-muted/50 p-4 rounded-lg">
        <div><span className="block text-muted-foreground">Original</span><strong>{output.originalCount} pages</strong></div>
        <div><span className="block text-muted-foreground">Removed</span><strong className="text-red-600">{output.deletedCount} pages</strong></div>
        <div><span className="block text-muted-foreground">Remaining</span><strong className="text-green-600">{output.remainingCount} pages</strong></div>
      </div>

      <div className="flex gap-4">
        <button onClick={() => downloadBlob(output.blob, output.filename)} className="rounded bg-primary px-8 py-2.5 text-sm text-primary-foreground hover:bg-primary/90">Download Updated PDF</button>
        <button onClick={onReset} className="rounded border px-8 py-2.5 text-sm hover:bg-accent">Delete More Pages</button>
      </div>
    </div>
  );
}