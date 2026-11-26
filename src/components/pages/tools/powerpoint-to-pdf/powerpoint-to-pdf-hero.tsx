import { PowerpointIcon } from "@/components/general/icons/pdf-icons";

export function PowerPointToPdfHero() {
  return (
    <header className="flex flex-col items-center gap-3 text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
        <PowerpointIcon className="size-4" />
        PPT → PDF
      </span>
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        PowerPoint to <span className="text-primary">PDF</span>
      </h1>
      <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
        Convert your PowerPoint presentations into professional PDF documents.
      </p>
    </header>
  );
}
