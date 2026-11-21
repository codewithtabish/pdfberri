import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PDF_TOOL_ICONS, PdfToolIconKey } from "@/components/general/icons/pdf-icons";

type Tool = {
  slug: PdfToolIconKey;
  title: string;
  description: string;
};

// Top row: the five most-used tools, shown larger
const FEATURED_TOOLS: Tool[] = [
  { slug: "merge-pdf", title: "Merge PDF", description: "Combine multiple PDFs." },
  { slug: "split-pdf", title: "Split PDF", description: "Extract pages easily." },
  { slug: "compress-pdf", title: "Compress PDF", description: "Reduce file size." },
  { slug: "pdf-to-word", title: "PDF to Word", description: "Convert to DOCX." },
  { slug: "word-to-pdf", title: "Word to PDF", description: "Convert to PDF." },
];

// Second row: more everyday tools, shown compact
const MORE_TOOLS: Tool[] = [
  { slug: "pdf-to-jpg", title: "PDF to JPG", description: "Save as image." },
  { slug: "jpg-to-pdf", title: "JPG to PDF", description: "Create PDF from images." },
  { slug: "edit-pdf", title: "Edit PDF", description: "Modify your PDF." },
  { slug: "rotate-pdf", title: "Rotate PDF", description: "Change orientation." },
  { slug: "protect-pdf", title: "Protect PDF", description: "Add password." },
  { slug: "unlock-pdf", title: "Unlock PDF", description: "Remove a known password." },
  { slug: "add-page-numbers", title: "Add Page Numbers", description: "Number your pages." },
];

type ToolCardProps = {
  tool: Tool;
  size: "featured" | "compact";
};

function ToolCard({ tool, size }: ToolCardProps) {
  const Icon = PDF_TOOL_ICONS[tool.slug];
  const isFeatured = size === "featured";

  return (
    <li>
      <Link
        href={`/tools/${tool.slug}`}
        className={`group flex h-full items-center rounded-xl border border-border bg-card shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
          isFeatured ? "gap-3.5 p-4" : "gap-3 p-3"
        }`}
      >
        <span
          className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground ${
            isFeatured ? "size-11" : "size-9"
          }`}
        >
          <Icon className={isFeatured ? "size-6" : "size-5"} />
        </span>

        <span className="min-w-0">
          <span
            className={`block font-semibold leading-snug text-foreground ${
              isFeatured ? "text-base" : "text-sm"
            }`}
          >
            {tool.title}
          </span>
          <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
            {tool.description}
          </span>
        </span>
      </Link>
    </li>
  );
}

export default function PopularTools() {
  return (
    <section aria-labelledby="popular-tools-heading" className="py-10 sm:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <h2
          id="popular-tools-heading"
          className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl"
        >
          Everything you need to manage PDFs
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Powerful PDF tools for your everyday document tasks.
        </p>
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {FEATURED_TOOLS.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} size="featured" />
        ))}
      </ul>

      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {MORE_TOOLS.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} size="compact" />
        ))}
      </ul>

      <div className="mt-6 flex justify-center">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View all PDF tools
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </section>
  );
}