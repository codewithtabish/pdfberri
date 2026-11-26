import Image from "next/image";
import Link from "next/link";

export function AboutCta() {
  return (
    <section className="relative isolate mt-6 overflow-hidden rounded-3xl bg-primary">
      <Image
        src="/images/about/about-cta.webp"
        alt=""
        aria-hidden="true"
        fill
        sizes="(min-width: 1280px) 1280px, 100vw"
        className="-z-10 object-cover"
      />

      <div className="flex flex-col items-center justify-between gap-6 px-6 py-10 text-center text-white lg:flex-row lg:px-12 lg:text-left">
        <h2 className="max-w-xl text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
          Join millions who work smarter with PDFBerri
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/tools"
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-primary shadow-lg transition hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Start for free
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/60 px-7 text-sm font-semibold text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}