import Image from "next/image";
import Link from "next/link";

import {
  ArrowRightIcon,
  BoltIcon,
  ShieldCheckIcon,
  SparkleIcon,
  StarIcon,
} from "@/components/general/icons/pdf-icons";

/**
 * Home hero — PDFBerri (split layout)
 * Left: badge, two-line heading with gradient underline, copy, CTAs, trust row.
 * Right: floating glass UI artwork.
 * Padding / max width come from the root Container, so none here.
 */
export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate grid items-center gap-6 pb-8 pt-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-4 lg:pb-12 lg:pt-8"
    >
      {/* soft background glows behind the artwork */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-0 -z-10 size-96 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 right-1/4 -z-10 size-72 rounded-full bg-violet-500/15 blur-3xl"
      />

      {/* ---------------------------- left ---------------------------- */}
      <div className="flex flex-col items-start">
        {/* badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-background/80 px-4 py-2 text-sm font-semibold text-primary shadow-sm shadow-primary/10 backdrop-blur">
          <SparkleIcon className="size-4" />
          New: AI tools for your PDFs
        </div>

        {/* heading */}
        <h1
          id="hero-heading"
          className="mt-5 text-4xl font-extrabold italic leading-[1.08] tracking-tight text-foreground sm:text-5xl xl:text-[3.5rem]"
        >
          <span className="block">Every PDF tool you need,</span>
          <span className="block">supercharged with AI</span>
        </h1>

        {/* gradient underline */}
        <div aria-hidden="true" className="mt-4 w-full max-w-lg space-y-1.5">
          <div className="h-1.5 w-4/5 rounded-full bg-linear-to-r from-primary via-violet-500 to-transparent" />
          <div className="h-0.5 w-2/5 rounded-full bg-primary/30" />
        </div>

        <p className="mt-5 max-w-lg text-pretty text-base text-muted-foreground sm:text-lg">
          Merge, split, compress, convert, edit and chat with your documents.
          Fast, secure and beautifully simple.
        </p>

        {/* CTAs */}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href="/tools"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-base font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Start for free
            <ArrowRightIcon className="size-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/ai-tools"
            className="inline-flex items-center rounded-full border-2 border-primary/70 bg-background/70 px-7 py-3 text-base font-bold text-primary backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-primary/10 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Explore AI Tools
          </Link>
        </div>

        {/* trust row */}
        <ul className="mt-8 flex flex-wrap items-center gap-y-3 text-sm font-medium text-foreground/80 sm:divide-x sm:divide-border">
          <li className="flex items-center gap-2 pr-5">
            <ShieldCheckIcon className="size-5 text-primary" />
            256-bit secure
          </li>
          <li className="flex items-center gap-2 pr-5 sm:px-5">
            <BoltIcon className="size-5 text-primary" />
            Lightning fast
          </li>
          <li className="flex items-center gap-2 sm:pl-5">
            <span className="flex" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} className="size-4 text-amber-400" />
              ))}
            </span>
            <span>
              <span className="font-bold text-foreground">4.9/5</span> from
              12,000+ users
            </span>
          </li>
        </ul>
      </div>

      {/* ---------------------------- right --------------------------- */}
      <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
        <Image
          src="/images/home/hero_transparent.png"
          alt="Chat with PDF preview showing an AI answer, a compressed-file notification and PDF, Word and PowerPoint file icons"
          width={1200}
          height={1000}
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="h-auto w-full mix-blend-multiply dark:mix-blend-normal"
        />
      </div>
    </section>
  );
}