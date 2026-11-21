import { ProtectIcon } from "@/components/general/icons/pdf-icons";

export function SplitPrivacyNote() {
  return (
    <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground sm:text-sm">
      <ProtectIcon className="size-4 shrink-0" />
      Your PDF is processed directly in your browser. Your document is not uploaded to our servers.
    </p>
  );
}
