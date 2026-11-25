export default function Loading() {
  return (
    <div className="flex flex-col gap-10 py-6 sm:py-8 lg:py-10">
      <header className="mx-auto max-w-2xl text-center">
        <div className="mx-auto h-10 w-3/4 animate-pulse rounded-lg bg-muted sm:h-12" />
        <div className="mx-auto mt-4 h-4 w-5/6 animate-pulse rounded bg-muted sm:h-5" />
      </header>
      <section className="mx-auto w-full max-w-5xl">
        <div className="flex h-64 w-full animate-pulse items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50">
          <svg className="h-8 w-8 animate-spin text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </section>
    </div>
  );
}