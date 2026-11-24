"use client";
// src/components/pages/tools/annotate-pdf/annotate-pdf-faq.tsx
import { useState } from "react";
import { ChevronDownIcon } from "@/components/general/icons/pdf-icons";

const FAQ = [
  {
    q: "Is my PDF uploaded to a server?",
    a: "No. Everything runs locally in your browser. Your file never leaves your device.",
  },
  {
    q: "Will my annotations be burned into the PDF?",
    a: "Yes — when you click Download, all annotations are drawn onto the PDF and saved as a new file.",
  },
  {
    q: "Does annotating invalidate digital signatures?",
    a: "Modifying a signed PDF can invalidate its signature. Keep a copy of the original if the signature must remain valid.",
  },
  {
    q: "Can I edit the original text?",
    a: "No. Annotations are added as a new layer on top of the document. The original text is unchanged.",
  },
  {
    q: "Which annotations are supported?",
    a: "Highlights, underlines, strikethroughs, freehand ink, rectangles, ellipses, arrows, lines, text boxes, and sticky-note comments.",
  },
  {
    q: "Are my annotations kept after I download?",
    a: "The downloaded PDF contains them permanently. Your editor session resets when you reload the page.",
  },
];

export function AnnotatePdfFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mt-12">
      <h2 className="text-center text-xl font-semibold">Frequently Asked Questions</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {FAQ.map((item, i) => (
          <div key={item.q} className="rounded-lg border border-border bg-card">
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium"
              aria-expanded={open === i}
            >
              {item.q}
              <ChevronDownIcon
                className={`h-4 w-4 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}
              />
            </button>
            {open === i && <p className="px-4 pb-3 text-sm text-muted-foreground">{item.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}