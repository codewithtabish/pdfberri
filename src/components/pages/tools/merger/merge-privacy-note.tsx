import Link from "next/link";
import { Lock } from "lucide-react";

interface MergePrivacyNoteProps {
  variant?: "inline" | "banner";
}

/**
 * These statements are about PDF contents during the merge only.
 * Re-audit them (network tab, analytics, error reporting) before launch.
 */
export function MergePrivacyNote({ variant = "inline" }: MergePrivacyNoteProps) {
  if (variant === "inline") {
    return (
      <p className="flex items-center justify-center gap-2 text-center text-xs text-foreground/65">
        <Lock aria-hidden="true" className="size-3.5 shrink-0" />
        Your PDF files are processed locally in your browser. They are not
        uploaded to our servers for merging.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center">
      <span
        aria-hidden="true"
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
      >
        <Lock className="size-5" />
      </span>
      <p className="text-sm text-foreground">
        <span className="font-semibold">Local processing:</span> Your documents
        stay on your device during the merge operation.{" "}
        <Link
          href="/privacy"
          className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Learn more
        </Link>
      </p>
    </div>
  );
}