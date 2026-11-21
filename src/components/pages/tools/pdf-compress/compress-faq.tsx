import { ChevronDownIcon } from "@/components/general/icons/pdf-icons";

const FAQS = [
  { question: "What does compression do?", answer: "PDFBerri repackages your document with structural optimization: object streams, metadata stripping (optional), and safe rewrite. It never alters page content or images on the local path." },
  { question: "Will this recompress images?", answer: "No. The local engine is lossless and does not recompress embedded images. Image downsampling requires a WASM engine that isn't installed in this build." },
  { question: "Why is my file sometimes larger?", answer: "Some PDFs are already aggressively compressed. Re-serializing them can add small overhead. We always show you the real byte count and never silently replace your original." },
  { question: "Does PDFBerri upload my PDF?", answer: "No. Local processing keeps your document on your device. Your PDF is not sent to PDFBerri servers for this tool." },
  { question: "Can I compress a password-protected PDF?", answer: "Not here. Encrypted PDFs are rejected. If you're authorized to open the file, remove the protection first, then try again." },
  { question: "Is there a file size limit?", answer: "Yes — up to 100 MB per PDF, because everything runs on your device." },
] as const;

export function CompressFaq() {
  return (
    <section aria-labelledby="compress-faq-heading" className="space-y-6">
      <h2 id="compress-faq-heading" className="text-center text-2xl font-bold text-foreground">Frequently asked questions</h2>
      <div className="space-y-2">
        {FAQS.map((item, index) => (
          <details key={item.question} name="compress-faq" open={index === 0} className="group rounded-xl border border-border bg-card open:bg-primary/5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {item.question}
              <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" />
            </summary>
            <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}