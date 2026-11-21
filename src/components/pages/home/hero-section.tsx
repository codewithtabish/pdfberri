import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LayoutGrid, Search, Sparkles } from "lucide-react";

type PopularTool = {
  label: string;
  href: string;
};

const POPULAR_TOOLS: PopularTool[] = [
  { label: "Merge PDF", href: "/tools/merge-pdf" },
  { label: "Compress PDF", href: "/tools/compress-pdf" },
  { label: "PDF to Word", href: "/tools/pdf-to-word" },
  { label: "PDF to JPG", href: "/tools/pdf-to-jpg" },
  { label: "Chat with PDF", href: "/ai-tools/chat-with-pdf" },
];

export default function HomeHero() {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-6 lg:py-16"
    >
      {/* Left: message, search, actions */}
      <div className="flex flex-col items-start">
        <p className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          Your complete PDF workspace
        </p>

        <h1
          id="home-hero-heading"
          className="mt-5 text-3xl font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]"
        >
          Everything you need to work with PDFs.
        </h1>

        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
          Convert, edit, merge, compress, and organize your PDFs. Or let AI help
          you understand, summarize, and explore your documents.
        </p>

        {/* Tool search: plain GET form, works without client JavaScript */}
        <form
          action="/tools"
          method="get"
          role="search"
          className="mt-7 w-full max-w-xl"
        >
          <label htmlFor="home-hero-search" className="sr-only">
            Search for a PDF tool
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm transition-shadow focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/40">
            <Search
              aria-hidden="true"
              className="ml-2.5 size-5 shrink-0 text-muted-foreground"
            />
            <input
              id="home-hero-search"
              name="q"
              type="search"
              autoComplete="off"
              placeholder="Search for a PDF tool..."
              className="h-10 min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Search PDF tools"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-[transform,opacity] hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ArrowRight aria-hidden="true" className="size-5" />
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/tools"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-[transform,opacity] hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <LayoutGrid aria-hidden="true" className="size-4" />
            Explore PDF Tools
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            href="/ai-tools/chat-with-pdf"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-primary/40 bg-card px-6 text-sm font-semibold text-primary transition-[transform,background-color] hover:bg-primary/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Sparkles aria-hidden="true" className="size-4" />
            Try AI PDF Assistant
          </Link>
        </div>

        <nav aria-label="Popular PDF tools" className="mt-7">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <li className="font-semibold text-foreground">Popular Tools:</li>
            {POPULAR_TOOLS.map((tool) => (
              <li key={tool.href}>
                <Link
                  href={tool.href}
                  className="font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {tool.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Right: product visual */}
      <div className="relative mx-auto w-full max-w-2xl lg:max-w-none">
        <Image
          src="/images/home/home-hero.webp"
          alt="PDFBerri AI Assistant answering a question about a PDF report, surrounded by PDF, Word, Excel and image file icons"
          width={1536}
          height={1024}
          priority
          sizes="(min-width: 1024px) 52vw, (min-width: 640px) 90vw, 100vw"
          className="h-auto w-full select-none"
        />
      </div>
    </section>
  );
}