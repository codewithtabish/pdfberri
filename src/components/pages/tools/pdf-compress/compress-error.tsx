import { AlertCircleIcon } from "@/components/general/icons/pdf-icons";

interface CompressErrorProps {
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export function CompressError({ message, onRetry, onBack }: CompressErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-10 text-center">
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <AlertCircleIcon className="size-6" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-foreground">We couldn&apos;t compress your PDF</h2>
      <p className="mt-2 max-w-md text-sm text-foreground/75">{message}</p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Try again
          </button>
        ) : null}
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Back to my file
          </button>
        ) : null}
      </div>
    </div>
  );
}