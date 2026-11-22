import { BrowserIcon, LockIcon } from "@/components/general/icons/pdf-icons";

export function JpgToPdfPrivacyNote() {
  return (
    <section
      aria-labelledby="jpg-to-pdf-privacy-heading"
      className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:flex-row sm:items-start"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <LockIcon className="size-6" />
      </span>
      <div>
        <h2 id="jpg-to-pdf-privacy-heading" className="text-xl font-bold text-foreground">
          Your images stay on your device
        </h2>
        <p className="mt-2 max-w-3xl leading-relaxed text-muted-foreground">
          This converter runs entirely in your browser. Your images are not uploaded to PDFBerri, and
          nothing is saved after you close or reset the page. Because everything happens on your device,
          very large batches depend on your available memory.
        </p>
        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <BrowserIcon className="size-4 text-primary" />
          Local processing, no account needed
        </p>
      </div>
    </section>
  );
}
