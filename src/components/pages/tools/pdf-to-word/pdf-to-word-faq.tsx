// src/components/pages/tools/pdf-to-word/pdf-to-word-faq.tsx

import { PlusIcon } from "@/components/general/icons/pdf-icons";
import { FAQ_ITEMS } from "./pdf-to-word-constants";

export function PdfToWordFaq() {
  return (
    <section aria-labelledby="pdf-to-word-faq" className="space-y-4">
      <h2
        id="pdf-to-word-faq"
        className="text-2xl font-extrabold tracking-tight"
      >
        Frequently Asked Questions
      </h2>
      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        {FAQ_ITEMS.map((item, index) => (
          <details key={item.question} className="group px-4 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              <span>
                {index + 1}. {item.question}
              </span>
              <PlusIcon className="size-4 shrink-0 transition-transform group-open:rotate-45 motion-reduce:transition-none" />
            </summary>
            <p className="pt-2 text-sm text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}