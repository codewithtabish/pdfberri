import Image from "next/image";

export function JpgToPdfHero() {
  return (
    <section aria-labelledby="jpg-to-pdf-heading" className="grid items-center gap-6 lg:grid-cols-2 lg:gap-10">
      <div>
        <h1
          id="jpg-to-pdf-heading"
          className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
        >
          JPG to PDF Converter
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Turn your images into a single PDF in seconds. Reorder, rotate, and choose your page size.
        </p>
      </div>
      <div className="relative aspect-[16/10] w-full">
        <Image
          src="/images/jpg-to-pdf/JPG_to_PDF_Hero.webp"
          alt="A JPG image turning into a PDF document"
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-contain object-center lg:object-right"
        />
      </div>
    </section>
  );
}
