import Image from "next/image";
import Link from "next/link";

export function ContactCta() {
  return (
    <section className="relative mt-12 w-full overflow-hidden rounded-3xl">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/contact/contact-cta-banner.webp"
          alt="CTA Banner"
          fill
          className="object-cover object-center"
        />
      </div>
      
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 -z-10 bg-primary/20 backdrop-blur-[2px]" />

      <div className="flex flex-col items-center justify-center px-6 py-16 text-center sm:py-20">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Ready to simplify your documents?
        </h2>
        <p className="mt-3 max-w-md text-primary-foreground/90 sm:text-lg">
          Explore our full suite of tools and see what PDFBerri can do for you.
        </p>
        
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/tools"
            className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-primary transition-transform hover:scale-105"
          >
            Explore tools
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-white/30 bg-white/10 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            About PDFBerri
          </Link>
        </div>
      </div>
    </section>
  );
}