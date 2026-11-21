import { PDF_TOOL_ICONS, PdfToolIconKey } from "@/components/general/icons/pdf-icons";
import Link from "next/link";

const RELATED: ReadonlyArray<{
  slug: PdfToolIconKey;
  title: string;
  text: string;
}> = [
  { slug: "split-pdf", title: "Split PDF", text: "Split your PDF into multiple files." },
  { slug: "compress-pdf", title: "Compress PDF", text: "Reduce file size." },
  { slug: "rotate-pdf", title: "Rotate PDF", text: "Rotate your PDF pages." },
  { slug: "organize-pdf", title: "Organize PDF", text: "Rearrange your pages." },
  { slug: "pdf-to-word", title: "PDF to Word", text: "Convert PDF to DOCX." },
  { slug: "protect-pdf", title: "Protect PDF", text: "Add password protection." },
];

export function MergeRelatedTools() {
  return (
    <section
      aria-labelledby="merge-related-heading"
      className="mx-auto w-full max-w-5xl py-10 sm:py-12"
    >
      <h2
        id="merge-related-heading"
        className="text-center text-2xl font-extrabold tracking-tight text-foreground"
      >
        Related PDF tools
      </h2>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {RELATED.map((tool) => {
          const Icon = PDF_TOOL_ICONS[tool.slug];
          return (
            <li key={tool.slug}>
              <Link
                href={`/tools/${tool.slug}`}
                className="group flex h-full flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:hover:translate-y-0"
              >
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {tool.title}
                </span>
                <span className="text-xs text-foreground/65">{tool.text}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}