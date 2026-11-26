import Image from "next/image";
import Link from "next/link";

export function CareersCta() {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-primary">
      <Image
        src="/images/careers/career-cta.webp"
        alt=""
        aria-hidden="true"
        fill
        sizes="(min-width: 1280px) 1280px, 100vw"
        className="-z-10 object-cover"
      />

      <div className="flex flex-col items-center gap-6 px-6 py-10 text-center text-white sm:py-12">
        <h2 className="max-w-2xl text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
          Build something great with PDFBerri
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="#open-positions"
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-primary shadow-lg transition hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            View open roles
          </Link>
          <Link
            href="/about"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/60 px-7 text-sm font-semibold text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Learn more
          </Link>
        </div>
      </div>
    </section>
  );
}