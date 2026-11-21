import { Download, ListOrdered, Upload } from "lucide-react";

const STEPS = [
  {
    icon: Upload,
    title: "Upload your PDFs",
    text: "Choose two or more PDF documents from your device.",
  },
  {
    icon: ListOrdered,
    title: "Arrange the order",
    text: "Drag the documents into your preferred order.",
  },
  {
    icon: Download,
    title: "Merge and download",
    text: "Combine your PDFs and save the final document.",
  },
] as const;

export function MergeHowItWorks() {
  return (
    <section
      aria-labelledby="merge-how-heading"
      className="mx-auto w-full max-w-5xl py-10 sm:py-12"
    >
      <h2
        id="merge-how-heading"
        className="text-center text-2xl font-extrabold tracking-tight text-foreground"
      >
        How to merge PDF files
      </h2>

      <ol className="mt-8 grid gap-6 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary"
            >
              {index + 1}
            </span>
            <div>
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <step.icon aria-hidden="true" className="size-4 text-primary" />
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-foreground/65">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}