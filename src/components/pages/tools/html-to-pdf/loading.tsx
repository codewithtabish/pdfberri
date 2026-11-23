export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse space-y-8">
      <div className="space-y-3 text-center">
        <div className="mx-auto h-9 w-80 rounded-lg bg-muted" />
        <div className="mx-auto h-5 w-96 max-w-full rounded bg-muted" />
      </div>
      <div className="h-64 rounded-2xl border border-border bg-muted/30" />
      <div className="h-24 rounded-xl border border-border bg-muted/20" />
      <div className="mx-auto h-12 w-48 rounded-lg bg-primary/20" />
    </div>
  );
}
