import { AlertCircleIcon } from "@/components/general/icons/pdf-icons";
import { SPLIT_UI } from "./split-constants";

interface SplitErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function SplitErrorState({ message, onRetry }: SplitErrorStateProps) {
  return (
    <div role="alert" className="flex flex-wrap items-start gap-3 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
      <AlertCircleIcon className="mt-0.5 size-5 shrink-0" />
      <p className="min-w-0 flex-1 font-medium">{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className={SPLIT_UI.dangerButton}>
          Try again
        </button>
      ) : null}
    </div>
  );
}
