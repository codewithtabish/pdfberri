import { ProtectIcon } from "@/components/general/icons/pdf-icons";
import { Reveal } from "./protect-motion";

export function ProtectEncryptionNote() {
  return (
    <Reveal>
      <aside
        aria-label="Encryption details"
        className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
      >
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <ProtectIcon className="size-6" />
          </span>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-bold text-foreground sm:text-base">
              PDFBerri applies password-based PDF encryption.
            </p>
            <p className="text-sm text-muted-foreground">Keep your password somewhere safe.</p>
          </div>
        </div>

        <div className="border-t border-primary/20 pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5">
          <p className="font-mono text-lg font-bold text-primary">AES-256</p>
          <p className="text-xs text-muted-foreground">Encryption</p>
        </div>
      </aside>
    </Reveal>
  );
}