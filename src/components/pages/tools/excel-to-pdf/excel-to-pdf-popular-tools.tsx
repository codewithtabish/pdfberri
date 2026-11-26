'use client';

import Link from 'next/link';
import { PDF_TOOL_ICONS } from '@/components/general/icons/pdf-icons';

const TOOLS = [
  { name: 'Merge PDF', slug: 'merge-pdf' },
  { name: 'Split PDF', slug: 'split-pdf' },
  { name: 'Compress PDF', slug: 'compress-pdf' },
  { name: 'PDF to Word', slug: 'pdf-to-word' },
  { name: 'Word to PDF', slug: 'word-to-pdf' },
  { name: 'PDF to Excel', slug: 'pdf-to-excel' },
  { name: 'PDF to JPG', slug: 'pdf-to-jpg' },
  { name: 'JPG to PDF', slug: 'jpg-to-pdf' },
];

export function ExcelPopularTools() {
  return (
    <section aria-labelledby="popular-pdf-tools">
      <h2 id="popular-pdf-tools" className="mb-4 text-xl font-bold text-foreground">
        Popular PDF Tools
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {TOOLS.map((tool) => {
          const Icon = PDF_TOOL_ICONS[tool.slug as keyof typeof PDF_TOOL_ICONS];
          return (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group flex min-w-[150px] flex-1 shrink-0 items-center gap-3 rounded-xl border border-border px-4 py-3 transition-all hover:border-primary/50 hover:bg-muted/50"
            >
              {Icon && (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </span>
              )}
              <span className="whitespace-nowrap text-sm font-semibold text-foreground">{tool.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}