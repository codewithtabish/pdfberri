export function AddWatermarkError({ message, onRetry }: { message: string, onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-destructive bg-destructive/10 p-12 text-center">
      <h2 className="text-xl font-semibold text-destructive mb-2">Something went wrong</h2>
      <p className="text-sm text-destructive/80 mb-6">{message}</p>
      <button onClick={onRetry} className="rounded bg-destructive text-white px-6 py-2.5 text-sm font-medium hover:bg-destructive/90">Try Again</button>
    </div>
  );
}