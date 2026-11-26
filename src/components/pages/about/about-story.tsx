import Image from "next/image";

export function AboutStory() {
  return (
    <section className="grid items-center gap-8 py-12 lg:grid-cols-2 lg:gap-12">
      <div>
        <div className="flex items-center gap-3 text-xs font-bold tracking-[0.2em] text-primary uppercase">
          Our story
          <span aria-hidden="true" className="h-px w-32 bg-primary/30 sm:w-48" />
        </div>

        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
          Built because PDFs shouldn&apos;t be painful
        </h2>

        <p className="mt-5 text-base font-medium text-pretty">
          PDFBerri was born from a simple idea: high-quality PDF tools should be
          fast, beautiful and free for everyone.
        </p>
        <p className="mt-4 text-pretty text-muted-foreground">
          Too often, we found PDF sites to be slow, cluttered with ads, and full
          of confusing options. So we built PDFBerri, a cleaner, faster and more
          helpful experience, with the power of AI.
        </p>
      </div>

      <div className="relative aspect-video overflow-hidden rounded-3xl border border-border shadow-lg shadow-primary/10 sm:aspect-25/9 lg:aspect-25/10">
        <Image
          src="/images/about/about-story.webp"
          alt="PDFBerri upload and chat with PDF interface preview"
          fill
          sizes="(min-width: 1024px) 560px, 100vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}