import Image from "next/image";
import Link from "next/link";
import {
  BriefcaseIcon,
  ChevronDownIcon,
} from "@/components/general/icons/pdf-icons";

export function CareersHero() {
  return (
    <section className="relative left-1/2 -mt-px w-screen -translate-x-1/2 overflow-hidden">
      <div className="relative flex min-h-120 items-center justify-center md:min-h-140 lg:min-h-150">
        <Image
          src="/images/careers/careers_hero.webp"
          alt=""
          aria-hidden="true"
          fill
          preload
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* soft glow behind the text */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 h-72 w-[min(90%,680px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/50 blur-3xl"
        />

        {/* fade into the page */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-background"
        />

        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center sm:px-6 md:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-4 py-1.5 text-sm font-semibold text-primary backdrop-blur">
            <BriefcaseIcon className="size-4" />
            Careers at PDFBerri
          </span>

          <h1 className="mt-6 text-4xl leading-[1.1] font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl">
            Help us make documents{" "}
            <span className="bg-linear-to-r from-primary via-sky-400 to-primary bg-clip-text text-transparent">
              effortless
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
            We are building simple, friendly PDF and AI tools for everyone. If
            that sounds like your kind of work, we would love to hear from you.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="#open-positions"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              View open roles
              <ChevronDownIcon className="size-4" />
            </Link>
            <Link
              href="#how-we-work"
              className="inline-flex h-12 items-center rounded-full border border-primary/30 bg-background/80 px-7 text-sm font-semibold backdrop-blur transition hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              How we work
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}