import { Button } from "@/components/ui/button";
import { AlertCircleIcon } from "@/components/general/icons/pdf-icons";

interface Props {
  message: string;
  onRetry: () => void;
}

export function PowerPointToPdfError({ message, onRetry }: Props) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
    >
      <AlertCircleIcon className="size-6 shrink-0 text-destructive" />
      <p className="min-w-0 flex-1 text-sm font-medium text-foreground">{message}</p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        Try another file
      </Button>
    </div>
  );
}
