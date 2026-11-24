import { LoaderIcon } from "@/components/general/icons/pdf-icons";
export function SignPdfProgress() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Processing PDF…</p>
    </div>
  );
}