import { Download, Files, ListOrdered } from "lucide-react";
import { MergePrivacyNote } from "./merge-privacy-note";
import { MERGE_LIMITS } from "./merge-constants";

const FEATURES = [
  {
    icon: ListOrdered,
    title: "Drag to reorder",
    text: "Change the order of your files easily.",
  },
  {
    icon: Files,
    title: "Works with multiple files",
    text: `Merge up to ${MERGE_LIMITS.maxFiles} PDFs in one go.`,
  },
  {
    icon: Download,
    title: "Simple download",
    text: "Save the merged PDF straight to your device.",
  },
] as const;

export function MergeFeatures() {
  return (
    <section
      aria-labelledby="merge-why-heading"
      className="mx-auto w-full max-w-5xl py-10 sm:py-12"
    >
      <h2
        id="merge-why-heading"
        className="text-center text-2xl font-extrabold tracking-tight text-foreground"
      >
        Why use PDFBerri to merge PDFs
      </h2>

      <ul className="mt-8 grid gap-6 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <li key={feature.title} className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
            >
              <feature.icon className="size-5" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-1 text-sm text-foreground/65">{feature.text}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <MergePrivacyNote variant="banner" />
      </div>
    </section>
  );
}