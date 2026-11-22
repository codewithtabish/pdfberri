// src/components/pages/tools/word-to-pdf/word-to-pdf-related-tools.tsx

import Link from "next/link";

import {
  ArrowRightIcon,
  CompressIcon,
  MergeIcon,
  ProtectIcon,
  WordIcon,
} from "@/components/general/icons/pdf-icons";

import { TOOLS_INDEX_ROUTE } from "./word-to-pdf-constants";

const RELATED = [
  { name: "PDF to Word", href: "/tools/pdf-to-word", Icon: WordIcon },
  { name: "Compress PDF", href: "/tools/compress-pdf", Icon: CompressIcon },
  { name: "Merge PDF", href: "/tools/merge-pdf", Icon: MergeIcon },
  { name: "Protect PDF", href: "/tools/protect-pdf", Icon: ProtectIcon },
] as const;

export function WordToPdfRelatedTools() {
  return (
    <section
      aria-labelledby="word-to-pdf-related-heading"
      className="space-y-4 rounded-2xl border border-border bg-card p-5"
    >
      <h2 id="word-to-pdf-related-heading" className="text-lg font-bold tracking-tight">
        Related tools
      </h2>
      <ul className="flex flex-wrap gap-2">
        {RELATED.map(({ name, href, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-background/60 px-3 text-sm font-semibold transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              <Icon className="size-4 text-primary" />
              {name}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={TOOLS_INDEX_ROUTE}
        className="inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        View all tools
        <ArrowRightIcon className="size-4" />
      </Link>
    </section>
  );
}
