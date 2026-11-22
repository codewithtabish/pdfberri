// src/components/pages/tools/word-to-pdf/word-to-pdf-faq.tsx

import { ChevronDownIcon } from "@/components/general/icons/pdf-icons";

export const WORD_TO_PDF_FAQS = [
  {
    question: "Will my formatting be preserved in the PDF?",
    answer:
      "Browser conversion reproduces text, headings, tables, images, headers, footers and page breaks as closely as it can, but it isn’t Microsoft Word. Layout can differ if your document uses fonts that aren’t installed on your device, or advanced features such as some text boxes and SmartArt. Always check the PDF before sharing it.",
  },
  {
    question: "Is my document private?",
    answer:
      "DOCX files are converted entirely inside your browser and aren’t uploaded. If a document needs server conversion, PDFBerri asks for your permission first, converts it in a temporary private folder, and removes the files when the conversion finishes.",
  },
  {
    question: "Why can’t I select text in the PDF?",
    answer:
      "Browser conversion captures each page as a high-resolution image, so the text in the PDF isn’t selectable or searchable. Server conversion, where available, creates a text-based PDF.",
  },
  {
    question: "Can I convert older .doc files?",
    answer:
      "Only when server conversion is enabled. The browser engine supports DOCX only, and PDFBerri will say so if .doc isn’t available.",
  },
  {
    question: "Are macros or scripts in my document run?",
    answer:
      "No. Documents are treated as untrusted. Files that contain macros are rejected, and nothing inside a document is executed.",
  },
  {
    question: "Is there a size limit?",
    answer:
      "Yes. Browser conversion supports DOCX files up to 50 MB and 250 pages. Very large or image-heavy documents may need more memory than your device has.",
  },
] as const;

export function WordToPdfFaq() {
  return (
    <section
      aria-labelledby="word-to-pdf-faq-heading"
      className="space-y-4 rounded-2xl border border-border bg-card p-5"
    >
      <h2 id="word-to-pdf-faq-heading" className="text-lg font-bold tracking-tight">
        Frequently asked questions
      </h2>
      <div className="space-y-2">
        {WORD_TO_PDF_FAQS.map((item) => (
          <details
            key={item.question}
            className="group rounded-xl border border-border bg-background/60 open:bg-muted/30"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              <h3 className="text-sm font-semibold">{item.question}</h3>
              <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" />
            </summary>
            <p className="px-4 pb-4 text-sm text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
