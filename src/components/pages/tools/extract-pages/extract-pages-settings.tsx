export function ExtractPagesSettings({ mode, setMode, onExtract, disabled }: any) {
  return (
    <div className="sticky bottom-4 flex items-center justify-between rounded-xl border bg-card p-4 shadow-lg mt-4">
      <div className="flex items-center gap-6">
        <span className="text-sm font-semibold">Extraction Settings:</span>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="radio" checked={mode === 'combined'} onChange={() => setMode('combined')} /> One PDF
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="radio" checked={mode === 'separate'} onChange={() => setMode('separate')} /> Separate PDFs
        </label>
      </div>
      <button onClick={onExtract} disabled={disabled} className="rounded bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        Extract Pages
      </button>
    </div>
  );
}