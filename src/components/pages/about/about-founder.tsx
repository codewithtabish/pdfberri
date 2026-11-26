import Image from "next/image";
import { Quote } from "lucide-react";
import { Mrs_Saint_Delafield } from "next/font/google";

const signatureFont = Mrs_Saint_Delafield({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export function AboutFounder() {
  return (
    <section
      id="founder"
      className="scroll-mt-24 overflow-hidden rounded-3xl border border-border bg-linear-to-br from-amber-50/80 via-card to-primary/5 p-6 sm:p-8 dark:from-amber-500/5"
    >
      <div className="flex items-center gap-3 text-[11px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
        From the founder
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>

      <div className="mt-6 grid items-center gap-8 md:grid-cols-[240px_1fr]">
        <figure className="mx-auto w-full max-w-60 text-center">
          <div className="relative aspect-4/5 overflow-hidden rounded-2xl border border-border shadow-lg">
            <Image
              src="/images/about/editor.webp"
              alt="Talha Tabish, founder of PDFBerri"
              fill
              sizes="240px"
              className="object-cover"
            />
          </div>

          <figcaption className="mt-4">
            <p className="font-serif text-xl font-bold">Talha Tabish</p>
            <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
              Founder &amp; Developer
            </p>

            {/* Signature */}
            <p
              aria-hidden="true"
              className={`${signatureFont.className} mt-2 -rotate-3 text-5xl leading-none text-primary/80 select-none`}
            >
              Talha Tabish
            </p>
          </figcaption>
        </figure>

        <div>
          <Quote
            aria-hidden="true"
            className="size-9 fill-primary/30 text-primary/30"
          />
          <blockquote className="mt-2 font-serif text-2xl leading-snug font-medium text-balance italic sm:text-3xl">
            We don&apos;t just build tools. We build the calm you feel when the
            work is already done.
          </blockquote>
          <p className="mt-5 text-pretty text-muted-foreground">
            I built PDFBerri because I was tired of dealing with slow, cluttered
            and ad-filled PDF websites. I wanted a place where anyone can merge,
            convert, edit and manage their PDFs, quickly, securely and for free.
          </p>
          <p className="mt-3 text-pretty text-muted-foreground">
            Our mission is to keep PDFBerri fast, private and genuinely helpful.
            Thank you for being part of our journey.
          </p>
        </div>
      </div>
    </section>
  );
}