/**
 * PDFBerri – Edit PDF
 * FAQ section
 * (No shadcn/ui – pure HTML + Tailwind + native details/summary)
 */

"use client";

const FAQ_ITEMS = [
  {
    q: "Is my PDF uploaded to a server?",
    a: "No. All editing happens entirely in your browser using PDF.js and pdf-lib. Your document never leaves your device.",
  },
  {
    q: "Can I edit existing text in any PDF?",
    a: "PDF is not a word-processor format. Text is often split into many small drawing operations or converted to outlines. You can reliably add new text, and we attempt to help with simple existing text when reconstruction is possible. Complex or scanned PDFs may only support covering or adding new content.",
  },
  {
    q: "Does the signature feature create a legally binding digital signature?",
    a: "No. The signature tool places a visual signature image (drawn, typed or uploaded). It is not a cryptographic digital signature or certificate-based signing operation.",
  },
  {
    q: "Is redaction secure?",
    a: "A black rectangle on top of content is not secure redaction. Where the installed libraries allow, we attempt to remove underlying content. When that is not possible we clearly indicate the limitation. Always verify the exported file if the content is sensitive.",
  },
  {
    q: "What is the maximum file size?",
    a: "The default limit is 50 MB and 200 pages. Very large documents may exhaust browser memory. For best results use reasonably sized files.",
  },
  {
    q: "Does undo / redo work across all edits?",
    a: "Yes. Most operations (text, images, annotations, page rotation, deletion, reordering) are recorded in a command history so you can undo and redo them.",
  },
];

export function EditPdfFaq() {
  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <h2 className="text-center text-xl font-semibold text-foreground">
        Frequently asked questions
      </h2>

      <div className="divide-y divide-border rounded-xl border bg-card">
        {FAQ_ITEMS.map((item, i) => (
          <details key={i} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/40 [&::-webkit-details-marker]:hidden">
              <span>{item.q}</span>
              <svg
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <div className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}