export function AddWatermarkProgress({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <svg className="animate-spin h-8 w-8 text-primary mb-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      <h2 className="text-xl font-semibold mb-2">Adding watermark...</h2>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}