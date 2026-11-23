"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "./html-to-pdf-constants";
import { cn } from "@/lib/utils";

export function HtmlToPdfFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Frequently Asked Questions</h2>
      <div className="divide-y divide-border rounded-xl border border-border">
        {FAQ_ITEMS.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={item.question}>
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left text-sm font-medium hover:bg-muted/30"
                aria-expanded={open}
              >
                {item.question}
                <svg
                  className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open && (
                <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
