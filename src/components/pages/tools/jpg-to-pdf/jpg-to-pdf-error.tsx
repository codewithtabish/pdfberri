import { AlertCircleIcon, XIcon } from "@/components/general/icons/pdf-icons";
import type { ValidationIssue } from "./jpg-to-pdf-types";

interface JpgToPdfErrorProps {
  title: string;
  message?: string;
  issues?: readonly ValidationIssue[];
  onDismiss?: () => void;
}

export function JpgToPdfError({ title, message, issues, onDismiss }: JpgToPdfErrorProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4"
    >
      <AlertCircleIcon className="mt-0.5 size-5 shrink-0 text-destructive" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">{title}</p>
        {message ? <p className="mt-1 text-sm text-muted-foreground">{message}</p> : null}
        {issues && issues.length > 0 ? (
          <ul className="mt-2 space-y-1 text-sm">
            {issues.map((issue, index) => (
              <li key={`${issue.fileName}-${index}`} className="text-muted-foreground">
                <span className="break-all font-medium text-foreground">{issue.fileName}</span>
                {": "}
                {issue.message}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <XIcon className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
