import Image from "next/image";
import Link from "next/link";

export function FaqSupport() {
  return (
    <section className="mx-auto mt-20 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-3xl border border-[#D6E4FF] bg-[#F0F7FF] p-8 sm:flex-row sm:p-12 dark:border-primary/20 dark:bg-primary/5">
        
        <div className="relative z-10 max-w-lg">
          <h2 className="text-3xl font-bold text-foreground">Still have questions?</h2>
          <p className="mt-3 text-muted-foreground">
            Our team is here to help. Get in touch and we'll do our best to guide you.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
              Contact Support
            </Link>
          
          </div>
        </div>

        {/* Mascot Image */}
        <div className="relative z-10 h-48 w-48 shrink-0 sm:h-56 sm:w-56">
          <Image
            src="/images/faq/pdfberri-support-mascot.webp"
            alt="PDFBerri Support Mascot"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </section>
  );
}