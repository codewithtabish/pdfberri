import { PowerpointIcon } from "@/components/general/icons/pdf-icons";

export function PdfToPowerpointHero() {
  return (
    <header className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
        <PowerpointIcon className="size-4 text-primary" />
        PDF → PPTX
      </span>
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        PDF to <span className="text-primary">PowerPoint</span>
      </h1>
      <p className="text-sm text-muted-foreground sm:text-base">
        Turn PDF pages into PowerPoint slides. Choose High-Fidelity slides that match the
        original pages, or Editable slides that rebuild text and images where possible.
        Everything is converted in your browser.
      </p>
    </header>
  );
}
