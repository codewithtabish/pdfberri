export function SignPdfSignaturePreview({ dataUrl, onClear }: { dataUrl: string, onClear: () => void }) {
  return (
    <div className="mt-4 rounded border border-border bg-white p-2 relative group">
      <img src={dataUrl} alt="Signature" className="mx-auto max-h-20 object-contain" />
      <button onClick={onClear} className="absolute top-1 right-1 hidden rounded-full bg-destructive p-1 text-white group-hover:block">
        <span className="sr-only">Clear</span>
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
}