export function ExtractPagesError({ message, onRetry }: { message: string, onRetry: () => void }) {
  return (
    <div className="text-center p-8 text-destructive">
      <p>{message}</p>
      <button onClick={onRetry} className="mt-4 text-sm underline">Try again</button>
    </div>
  );
}