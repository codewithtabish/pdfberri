import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";

export function AboutHero() {
  return (
    // Full-bleed breakout: escapes the Container's max-w-7xl + padding
    <section className="relative left-1/2 -mt-px w-screen -translate-x-1/2 overflow-hidden">
      <div className="relative flex min-h-130 items-center justify-center md:min-h-150 lg:min-h-160">
        {/* Background image */}
        <Image
          src="/images/about/about_hero.webp"
          alt=""
          aria-hidden="true"
          fill
          preload
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Soften the blurry side bands of the image */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-[14%] bg-linear-to-r from-background via-background/60 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-[14%] bg-linear-to-l from-background via-background/60 to-transparent"
        />

        {/* Brand glow behind the headline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[min(90%,720px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/60 blur-3xl"
        />

        {/* Fade into the page below */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-b from-transparent to-background"
        />

        {/* Floating chips (desktop only, tune positions to your artwork) */}
        <div
          aria-hidden="true"
          className="motion-safe:animate-float absolute left-[12%] bottom-[24%] hidden items-center gap-2 rounded-2xl border border-white/70 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-lg shadow-primary/10 backdrop-blur-md lg:flex"
        >
          <span className="size-2 rounded-full bg-primary" />
          Summarize this PDF
        </div>
        <div
          aria-hidden="true"
          className="motion-safe:animate-float absolute right-[11%] top-[16%] hidden items-center gap-2 rounded-2xl border border-white/70 bg-emerald-50/85 px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-lg shadow-emerald-500/10 backdrop-blur-md [animation-delay:1.5s] lg:flex"
        >
          <span className="size-2 rounded-full bg-emerald-500" />
          Merged 3 files
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center sm:px-6 md:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-1.5 text-sm font-semibold backdrop-blur">
            <Heart className="size-4 fill-red-500 text-red-500" />
            About PDFBerri
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-balance sm:text-5xl md:text-6xl">
            We make documents
            <span className="block bg-linear-to-r from-primary via-sky-400 to-primary bg-clip-text pb-2 text-transparent">
              effortless
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
            PDFBerri is a modern home for every PDF tool you need, supercharged
            with AI, built to be fast, private and genuinely pleasant to use.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/tools"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Explore tools
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#founder"
              className="inline-flex h-12 items-center rounded-full border border-primary/30 bg-background/80 px-7 text-sm font-semibold text-foreground backdrop-blur transition hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Meet the founder
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}