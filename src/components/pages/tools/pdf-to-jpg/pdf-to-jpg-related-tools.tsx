import Link from "next/link";
import { ArrowRightIcon, CompressIcon, MergeIcon, SplitIcon, WordIcon } from "@/components/general/icons/pdf-icons";

const RELATED = [
  { title: "Merge PDF", description: "Combine multiple PDFs into one.", href: "/tools/merge-pdf", Icon: MergeIcon },
  { title: "Split PDF", description: "Separate a PDF into parts.", href: "/tools/split-pdf", Icon: SplitIcon },
  { title: "Compress PDF", description: "Reduce PDF file size.", href: "/tools/compress-pdf", Icon: CompressIcon },
  { title: "PDF to Word", description: "Convert PDF to editable Word.", href: "/tools/pdf-to-word", Icon: WordIcon },
];

export function PdfToJpgRelatedTools() {
  return (
    <section aria-labelledby="related-tools-heading" className="space-y-4 pt-8">
      <div className="flex items-center justify-between">
        <h2 id="related-tools-heading" className="text-xl font-bold text-foreground">Related Tools</h2>
        <Link href="/tools" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          Explore all tools <ArrowRightIcon className="size-4" />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {RELATED.map((tool) => (
          <Link key={tool.href} href={tool.href} className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50">
            <div className="flex items-center gap-3">
              <tool.Icon className="size-8 text-primary" />
              <div>
                <p className="text-sm font-bold text-foreground">{tool.title}</p>
                <p className="text-xs text-muted-foreground">{tool.description}</p>
              </div>
            </div>
            <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </section>
  );
}