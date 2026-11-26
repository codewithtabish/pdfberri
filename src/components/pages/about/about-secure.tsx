import Image from "next/image";
import { Check } from "lucide-react";
import { SECURITY_POINTS } from "@/data/about-data";

export function AboutSecure() {
  return (
    <section className="relative isolate mt-6 overflow-hidden rounded-3xl border border-border">
      <Image
        src="/images/about/about-secure.webp"
        alt=""
        aria-hidden="true"
        fill
        sizes="(min-width: 1280px) 1280px, 100vw"
        className="-z-10 object-cover object-right"
      />
      {/* keeps text readable when the image crops on small screens */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-r from-white/85 via-white/40 to-transparent md:from-transparent md:via-transparent"
      />

      {/* fixed dark text: the artwork stays light in dark mode */}
      <div className="px-6 py-8 text-slate-900 sm:px-10 sm:py-10">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Secure by design</h2>
        <ul className="mt-4 space-y-2">
          {SECURITY_POINTS.map((point) => (
            <li key={point} className="flex items-center gap-2.5 text-sm font-medium sm:text-base">
              <span className="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}