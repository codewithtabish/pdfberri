import Image from "next/image";
import Link from "next/link";

export function CookiesCta() {
  return (
    <section className="relative mx-auto mt-16 w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="relative w-full overflow-hidden rounded-3xl">
        
        {/* Full-Width Background Image */}
        <div className="absolute top-0 left-1/2 -z-10 h-full w-screen -translate-x-1/2">
          <Image
            src="/images/privacy/career-cta.webp"
            alt="CTA Banner Background"
            fill
            className="object-cover object-center"
          />
        </div>
        
        {/* Overlay */}
        <div className="absolute top-0 left-1/2 -z-10 h-full w-screen -translate-x-1/2 bg-primary/20 backdrop-blur-[2px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center px-6 py-16 text-center sm:py-20">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to simplify your documents?
          </h2>
          <p className="mt-3 max-w-md text-primary-foreground/90 sm:text-lg">
            Explore powerful PDF tools and make your document workflow easier.
          </p>
          
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/tools"
              className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-primary shadow-sm transition-transform hover:scale-105"
            >
              Explore PDF Tools →
            </Link>
            <Link
              href="/tools/ai"
              className="rounded-full border border-white/30 bg-white/10 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Discover AI Tools →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}