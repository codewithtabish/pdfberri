export function AddWatermarkPreviewToolbar({ current, total, onPrev, onNext }: { current: number, total: number, onPrev: () => void, onNext: () => void }) {
  return (
    <div className="flex justify-between w-full max-w-[400px] mt-4 p-2 border rounded">
      <button disabled={current <= 1} onClick={onPrev} className="px-4 py-1 hover:bg-accent rounded disabled:opacity-50 text-sm">Prev</button>
      <span className="text-sm">Page {current} of {total}</span>
      <button disabled={current >= total} onClick={onNext} className="px-4 py-1 hover:bg-accent rounded disabled:opacity-50 text-sm">Next</button>
    </div>
  );
}