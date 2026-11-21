import { ChevronDownIcon } from "@/components/general/icons/pdf-icons";
import { SPLIT_FAQS, SPLIT_UI } from "./split-constants";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: SPLIT_FAQS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export function SplitFaq() {
  return (
    <section aria-labelledby="split-faq-heading" className="space-y-6">
      <h2 id="split-faq-heading" className="text-center text-2xl font-bold text-foreground">
        Frequently asked questions
      </h2>
      <div className="space-y-2">
        {SPLIT_FAQS.map((item, index) => (
          <details key={item.question} name="split-faq" open={index === 0} className="group rounded-xl border border-border bg-card open:bg-primary/5">
            <summary className={`flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden ${SPLIT_UI.focusRing}`}>
              {item.question}
              <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" />
            </summary>
            <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
    </section>
  );
}
