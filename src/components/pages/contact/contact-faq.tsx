import { ChevronDownIcon } from "@/components/general/icons/pdf-icons";

const FAQS = [
  { q: "How do I convert a PDF file?", a: "Simply navigate to our PDF to Word tool, upload your file, and click convert. The process takes seconds." },
  { q: "Is PDFBerri free to use?", a: "Yes, most of our essential PDF tools are completely free. AI tools may have usage limits." },
  { q: "Can I use PDFBerri on mobile?", a: "Absolutely. Our platform is fully responsive and designed to work perfectly on any device." },
  { q: "How can I get support?", a: "You can use the contact form above, or reach out to our support email directly." },
];

export function ContactFaq() {
  return (
    <section className="mt-16 flex flex-col items-center pb-8">
      <h2 className="text-2xl font-bold text-foreground">Frequently asked questions</h2>
      
      <div className="mt-8 w-full max-w-3xl space-y-3">
        {FAQS.map((faq, i) => (
          <details key={i} className="group rounded-xl border border-border bg-card [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between p-5 font-medium text-foreground">
              <span>{faq.q}</span>
              <ChevronDownIcon className="size-5 text-muted-foreground transition-transform group-open:-rotate-180" />
            </summary>
            <div className="px-5 pb-5 text-sm text-muted-foreground">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}