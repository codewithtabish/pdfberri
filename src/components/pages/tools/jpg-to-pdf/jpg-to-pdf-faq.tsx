import { ChevronDownIcon } from "@/components/general/icons/pdf-icons";
import { JPG_TO_PDF_FAQS } from "./jpg-to-pdf-config";

export function JpgToPdfFaq() {
  return (
    <section aria-labelledby="jpg-to-pdf-faq-heading" className="flex flex-col gap-5">
      <h2 id="jpg-to-pdf-faq-heading" className="text-2xl font-bold text-foreground sm:text-3xl">
        JPG to PDF questions
      </h2>
      <div className="flex flex-col gap-3">
        {JPG_TO_PDF_FAQS.map((faq) => (
          <details key={faq.question} className="group rounded-2xl border border-border bg-card">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl p-5 font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              <h3 className="text-base font-semibold">{faq.question}</h3>
              <ChevronDownIcon className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" />
            </summary>
            <p className="px-5 pb-5 leading-relaxed text-muted-foreground">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
