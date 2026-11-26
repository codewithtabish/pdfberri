import Image from "next/image";
import { SearchIcon } from "@/components/general/icons/pdf-icons";

export function FaqHero() {
  return (
    <section className="relative flex w-screen left-1/2 -translate-x-1/2 flex-col items-center pt-16 pb-32 sm:pt-24">
      {/* Full-Width Background Image Layer */}
      <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden">
        <Image
          src="/images/faq/pdfberri-hero-1600x600.webp"
          alt="FAQ Hero"
          fill
          priority
          className="object-cover object-center sm:object-top"
        />
      </div>

      {/* Foreground Content (Centered and maxed out like the mockup) */}
      <div className="relative z-10 flex w-full max-w-6xl flex-col items-start px-4 sm:px-6 lg:px-8">
        <h1 className="max-w-xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Frequently Asked <br className="hidden sm:block" /> Questions
        </h1>
        <p className="mt-4 max-w-md text-lg text-muted-foreground sm:text-xl">
          Find helpful answers about PDFBerri's tools, document processing, AI features, privacy, and everything you need to get started.
        </p>
        
        {/* Decorative underline */}
        <div className="mt-6 h-1.5 w-16 rounded-full bg-primary" />
      </div>

      {/* Floating Search Bar */}
      <div className="absolute -bottom-10 left-1/2 z-20 w-full max-w-3xl -translate-x-1/2 px-4 sm:px-6">
        <div className="flex w-full items-center gap-2 rounded-full border border-border bg-background p-2 shadow-xl shadow-black/5">
          <div className="flex flex-1 items-center gap-3 px-4">
            <SearchIcon className="size-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search for questions, tools, or topics..." 
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
            Search
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Popular searches:</span>
          <span className="cursor-pointer hover:text-primary hover:underline">Merge PDF,</span>
          <span className="cursor-pointer hover:text-primary hover:underline">Compress PDF,</span>
          <span className="cursor-pointer hover:text-primary hover:underline">PDF to Word,</span>
          <span className="cursor-pointer hover:text-primary hover:underline">Privacy</span>
        </div>
      </div>
    </section>
  );
}