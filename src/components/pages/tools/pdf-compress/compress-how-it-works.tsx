import { DownloadIcon, OrganizeIcon, UploadIcon } from "@/components/general/icons/pdf-icons";

const STEPS = [
  { title: "Upload your PDF", description: "Choose a PDF from your device.", Icon: UploadIcon },
  { title: "Choose compression", description: "Pick a preset or fine-tune settings.", Icon: OrganizeIcon },
  { title: "Download result", description: "Save the optimized PDF.", Icon: DownloadIcon },
] as const;

export function CompressHowItWorks() {
  return (
    <section aria-labelledby="compress-how-heading" className="space-y-6">
      <h2 id="compress-how-heading" className="text-center text-2xl font-bold text-foreground">How to compress a PDF</h2>
      <ol className="grid gap-4 md:grid-cols-3">
        {STEPS.map(({ title, description, Icon }, index) => (
          <li key={title} className="flex items-center gap-3">
            <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {index + 1}
            </span>
            <Icon className="size-6 shrink-0 text-primary" />
            <div>
              <h3 className="text-sm font-bold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}