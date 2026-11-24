"use client";
import { useState } from "react";
import { ChevronDownIcon } from "@/components/general/icons/pdf-icons";
const FAQ = [
  { q: "How do I sign a PDF?", a: "Upload your PDF, draw or type your signature, click 'Add to Document', place it where you want, and download." },
  { q: "Can I add multiple signatures?", a: "Yes, you can add as many signatures and fields as you need." },
  { q: "Can I choose where to place my signature?", a: "Yes, drag and drop the signature exactly where you need it." },
  { q: "Does signing change the original file?", a: "No, we generate a new signed document. Your original file is untouched." },
  { q: "Is my signature secure?", a: "Yes, everything happens locally in your browser. Nothing is uploaded." },
];
export function SignPdfFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mt-12">
      <h2 className="text-center text-xl font-semibold">Frequently Asked Questions</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {FAQ.map((item, i) => (
          <div key={item.q} className="rounded-lg border border-border bg-card">
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium">
              {item.q}
              <ChevronDownIcon className={`h-4 w-4 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && <p className="px-4 pb-3 text-sm text-muted-foreground">{item.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}