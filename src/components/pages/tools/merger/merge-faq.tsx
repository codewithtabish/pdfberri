import { ChevronDown } from "lucide-react";
import { formatBytes } from "./merge-utils";
import { MERGE_LIMITS } from "./merge-constants";

const FAQS = [
  {
    question: "Is there a limit on the number of files?",
    answer: `You can merge up to ${MERGE_LIMITS.maxFiles} files at once, up to ${formatBytes(MERGE_LIMITS.maxFileSizeBytes)} each and ${formatBytes(MERGE_LIMITS.maxTotalSizeBytes)} combined. Because merging happens in your browser, very large files may take longer or may not fit in your device's memory.`,
  },
  {
    question: "Can I change the order of the pages?",
    answer:
      "Yes. Drag files by their cards, or use the up and down buttons. Files are merged in the order shown, and each document's pages keep their original order.",
  },
  {
    question: "Will merging reduce the quality?",
    answer:
      "PDFBerri copies the pages from each document into a new file. It does not turn pages into images. Some document-level features, such as bookmarks, may not carry over to the merged file.",
  },
  {
    question: "Can I merge password-protected PDFs?",
    answer:
      "No. Password-protected or encrypted PDFs are rejected. If you are authorized to open the file, remove the protection in the app that created it, then add it again.",
  },
] as const;

export function MergeFaq() {
  return (
    <section
      aria-labelledby="merge-faq-heading"
      className="mx-auto w-full max-w-3xl py-10 sm:py-12"
    >
      <h2
        id="merge-faq-heading"
        className="text-center text-2xl font-extrabold tracking-tight text-foreground"
      >
        Frequently asked questions
      </h2>

      <div className="mt-6 flex flex-col gap-2">
        {FAQS.map((item, index) => (
          <details
            key={item.question}
            open={index === 0}
            className="group rounded-xl border border-border bg-card"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronDown
                aria-hidden="true"
                className="size-4 shrink-0 text-foreground/65 transition-transform group-open:rotate-180 motion-reduce:transition-none"
              />
            </summary>
            <p className="px-4 pb-4 text-sm leading-relaxed text-foreground/70">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}