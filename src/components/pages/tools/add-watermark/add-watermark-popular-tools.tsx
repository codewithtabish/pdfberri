// src/components/pages/tools/add-watermark/add-watermark-popular-tools.tsx

import Link from 'next/link';
import {
  PDF_TOOL_ICONS,
  type PdfToolIconKey,
} from '@/components/general/icons/pdf-icons';

interface PopularTool {
  label: string;
  href: string;
  icon: PdfToolIconKey;
}

const TOOLS: PopularTool[] = [
  { label: 'Merge PDF', href: '/tools/merge-pdf', icon: 'merge-pdf' },
  { label: 'Split PDF', href: '/tools/split-pdf', icon: 'split-pdf' },
  { label: 'Compress PDF', href: '/tools/compress-pdf', icon: 'compress-pdf' },
  { label: 'Rotate PDF', href: '/tools/rotate-pdf', icon: 'rotate-pdf' },
  { label: 'Protect PDF', href: '/tools/protect-pdf', icon: 'protect-pdf' },
  { label: 'Unlock PDF', href: '/tools/unlock-pdf', icon: 'unlock-pdf' },
  { label: 'Edit PDF', href: '/tools/edit-pdf', icon: 'edit-pdf' },
  { label: 'PDF to Word', href: '/tools/pdf-to-word', icon: 'pdf-to-word' },
  { label: 'PDF to JPG', href: '/tools/pdf-to-jpg', icon: 'pdf-to-jpg' },
  { label: 'JPG to PDF', href: '/tools/jpg-to-pdf', icon: 'jpg-to-pdf' },
];

export function AddWatermarkPopularTools() {
  return (
    <section aria-labelledby="popular-tools-heading" className="mt-16 w-full">
      <h2 id="popular-tools-heading" className="mb-8 text-center text-2xl font-semibold tracking-tight">
        Popular PDF Tools
      </h2>

      {/* Single horizontal row, scrollable on mobile, centered on large screens */}
      <div className="flex w-full flex-nowrap items-stretch justify-start gap-3 overflow-x-auto pb-4 sm:justify-center sm:overflow-visible scrollbar-hide">
        {TOOLS.map((tool) => {
          const Icon = PDF_TOOL_ICONS[tool.icon];

          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex w-[100px] shrink-0 flex-col items-center justify-between gap-3 rounded-2xl border border-border/50 bg-card p-4 transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-accent/50 hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-center text-[11px] font-medium leading-tight text-muted-foreground transition-colors group-hover:text-foreground">
                {tool.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}