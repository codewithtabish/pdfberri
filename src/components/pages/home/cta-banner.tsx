import Image from "next/image";
import Link from "next/link";

import { ArrowRightIcon } from "@/components/general/icons/pdf-icons";

export function CtaBanner() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative isolate mt-10 overflow-hidden rounded-3xl bg-linear-to-r from-[#1F6BFF] via-[#3A8DFF] to-[#4DB8FF] shadow-xl shadow-primary/20 sm:mt-12"
    >
      {/* Background art (decorations sit on the left and right edges) */}
      <Image
        src="/images/home/pdfberri-cta-banner.webp"
        alt=""
        fill
        sizes="(min-width: 1280px) 1280px, 100vw"
        className="-z-10 object-cover object-center"
      />

      <div className="flex flex-col items-center justify-center gap-5 px-6 py-10 text-center sm:py-12 md:px-28 lg:flex-row lg:gap-8 lg:px-40">
        <h2
          id="cta-heading"
          className="text-balance text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl"
        >
          Ready to work smarter with your PDFs?
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/tools"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-primary shadow-md shadow-black/10 transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Start for free
            <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>

          <Link
            href="/ai-tools"
            className="inline-flex items-center rounded-full border border-white/60 bg-white/10 px-6 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Explore AI Tools
          </Link>
        </div>
      </div>
    </section>
  );
}