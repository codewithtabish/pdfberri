// src/app/tools/add-watermark/loading.tsx

export default function Loading() {
  return (
    <div className="flex flex-col gap-10 py-6 sm:py-8 lg:py-10">
      {/* Header Skeleton */}
      <header className="mx-auto max-w-2xl text-center">
        <div className="mx-auto h-10 w-3/4 animate-pulse rounded-lg bg-muted sm:h-12" />
        <div className="mx-auto mt-4 h-4 w-5/6 animate-pulse rounded bg-muted sm:h-5" />
      </header>

      {/* Main Workspace Skeleton */}
      <section className="mx-auto w-full max-w-5xl">
        {/* File Info Bar Skeleton */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-muted sm:w-48" />
              <div className="h-3 w-20 animate-pulse rounded bg-muted sm:w-24" />
            </div>
          </div>
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        </div>

        {/* Two-column layout skeleton for settings & preview */}
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Settings Column Skeleton */}
          <div className="flex flex-col gap-6">
            {/* Type Selector */}
            <div className="flex h-11 animate-pulse rounded-lg bg-muted" />

            {/* Inputs */}
            <div className="space-y-4">
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
              <div className="flex gap-4">
                <div className="h-10 w-24 animate-pulse rounded bg-muted" />
                <div className="h-10 w-12 animate-pulse rounded bg-muted" />
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-6 mt-2">
              <div className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
              </div>
            </div>

            {/* Position Grid */}
            <div className="space-y-2">
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded border border-border bg-muted" />
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-4 h-12 w-full animate-pulse rounded bg-muted" />
          </div>

          {/* Preview Column Skeleton */}
          <div className="flex flex-col items-center">
            <div className="flex h-[500px] w-full max-w-[400px] animate-pulse items-center justify-center rounded-lg border border-border bg-muted/50">
              {/* Subtle loading spinner inside the preview box */}
              <svg
                className="h-8 w-8 animate-spin text-muted-foreground"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            
            {/* Pagination toolbar skeleton */}
            <div className="mt-4 flex w-full max-w-[400px] items-center justify-between rounded-lg border border-border bg-card p-2">
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}