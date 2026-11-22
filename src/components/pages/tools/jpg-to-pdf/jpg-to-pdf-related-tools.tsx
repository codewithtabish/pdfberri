import Link from "next/link";
import {
  ArrowRightIcon,
  ChevronRightIcon,
  CompressIcon,
  ImageIcon,
  MergeIcon,
  ProtectIcon,
} from "@/components/general/icons/pdf-icons";

const RELATED = [
  { href: "/tools/pdf-to-jpg", title: "PDF to JPG", description: "Convert PDF pages to JPG images.", Icon: ImageIcon },
  { href: "/tools/merge-pdf", title: "Merge PDF", description: "Combine multiple PDFs into one.", Icon: MergeIcon },
  { href: "/tools/compress-pdf", title: "Compress PDF", description: "Reduce PDF file size.", Icon: CompressIcon },
  { href: "/tools/protect-pdf", title: "Protect PDF", description: "Add a password to your PDF.", Icon: ProtectIcon },
] as const;

export function JpgToPdfRelatedTools() {
  return (
    <section aria-labelledby="jpg-to-pdf-related-heading" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="jpg-to-pdf-related-heading" className="text-2xl font-bold text-foreground sm:text-3xl">
          Related tools
        </h2>
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 rounded-md font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Explore all tools
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {RELATED.map(({ href, title, description, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex h-full items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-foreground">{title}</span>
                <span className="block text-sm text-muted-foreground">{description}</span>
              </span>
              <ChevronRightIcon className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
