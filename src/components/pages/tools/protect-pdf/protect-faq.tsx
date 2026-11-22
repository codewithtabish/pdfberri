"use client";

import { useState } from "react";
import { MotionConfig, motion } from "framer-motion";
import { PlusIcon, QuizIcon } from "@/components/general/icons/pdf-icons";
import { cn } from "@/lib/utils";
import { PROTECT_FAQS } from "./protect-config";
import { Reveal } from "./protect-motion";

interface FaqItemProps {
  id: string;
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}

function FaqItem({ id, question, answer, open, onToggle }: FaqItemProps) {
  const buttonId = `protect-faq-${id}-button`;
  const panelId = `protect-faq-${id}-panel`;

  return (
    <div className={cn("rounded-2xl border bg-card transition-colors", open ? "border-primary/40" : "border-border")}>
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-3.5 text-left text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span>{question}</span>
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 text-primary"
          >
            <PlusIcon className="size-4" />
          </motion.span>
        </button>
      </h3>
      <motion.div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="overflow-hidden"
        inert={!open}
      >
        <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{answer}</p>
      </motion.div>
    </div>
  );
}

export function ProtectFaq() {
  const [openId, setOpenId] = useState<string | null>(null);
  const half = Math.ceil(PROTECT_FAQS.length / 2);
  const columns = [PROTECT_FAQS.slice(0, half), PROTECT_FAQS.slice(half)];

  return (
    <MotionConfig reducedMotion="user">
      <Reveal>
        <section
          aria-labelledby="protect-faq-heading"
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] lg:gap-10"
        >
          <div className="flex flex-col gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <QuizIcon className="size-6" />
            </span>
            <h2 id="protect-faq-heading" className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-muted-foreground">
              Find quick answers to common questions about protecting your PDFs.
            </p>
          </div>

          <div className="grid items-start gap-3 md:grid-cols-2">
            {columns.map((items, columnIndex) => (
              <div key={columnIndex} className="flex flex-col gap-3">
                {items.map((faq) => (
                  <FaqItem
                    key={faq.id}
                    id={faq.id}
                    question={faq.question}
                    answer={faq.answer}
                    open={openId === faq.id}
                    onToggle={() => setOpenId((current) => (current === faq.id ? null : faq.id))}
                  />
                ))}
              </div>
            ))}
          </div>
        </section>
      </Reveal>
    </MotionConfig>
  );
}