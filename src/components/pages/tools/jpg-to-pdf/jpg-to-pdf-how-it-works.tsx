import { DownloadIcon, SlidersIcon, UploadIcon } from "@/components/general/icons/pdf-icons";

const STEPS = [
  {
    title: "Add your images",
    description: "Select or drop JPG, JPEG or PNG files. Each one becomes a page, in the order you see.",
    Icon: UploadIcon,
  },
  {
    title: "Arrange and adjust",
    description: "Drag images into order, rotate them, then choose page size, orientation, margin and fit.",
    Icon: SlidersIcon,
  },
  {
    title: "Convert and download",
    description: "Your PDF is created in your browser. Download it when the progress bar finishes.",
    Icon: DownloadIcon,
  },
] as const;

export function JpgToPdfHowItWorks() {
  return (
    <section aria-labelledby="jpg-to-pdf-how-heading" className="flex flex-col gap-5">
      <h2 id="jpg-to-pdf-how-heading" className="text-2xl font-bold text-foreground sm:text-3xl">
        How to convert JPG to PDF
      </h2>
      <ol className="grid gap-4 md:grid-cols-3">
        {STEPS.map(({ title, description, Icon }, index) => (
          <li key={title} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-6" />
            </span>
            <div>
              <h3 className="font-bold text-foreground">
                <span className="sr-only">Step {index + 1}: </span>
                {title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
