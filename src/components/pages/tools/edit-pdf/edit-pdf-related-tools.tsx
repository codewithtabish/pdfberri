// src/components/pages/tools/edit-pdf/edit-pdf-related-tools.tsx
// Server Component. No 'use client'.

import Link from 'next/link';
import {
  PDF_TOOL_ICONS,
  type PdfToolIconKey,
} from '@/components/general/icons/pdf-icons';

/**
 * IMPORTANT:
 * The `icon` values below MUST exist as keys on `PDF_TOOL_ICONS`.
 * Open `src/components/general/icons/pdf-icons.tsx` and confirm the exact keys.
 * If any key below is missing in your project, swap it for one that exists —
 * the fallback renders the text "PDF" so the card never looks broken.
 *
 * The `href` values MUST match routes that actually exist in your `src/app` tree.
 * Adjust them to your real paths — do not invent URLs.
 */

interface RelatedTool {
  label: string;
  href: string;
  icon: PdfToolIconKey;
  description: string;
}

const RELATED_TOOLS: RelatedTool[] = [
  {
    label: 'Merge PDF',
    href: '/tools/merger',
    icon: 'merge' as PdfToolIconKey,
    description: 'Combine multiple PDFs',
  },
  {
    label: 'Split PDF',
    href: '/tools/split-pdf',
    icon: 'split' as PdfToolIconKey,
    description: 'Separate pages into files',
  },
  {
    label: 'Compress PDF',
    href: '/tools/pdf-compress',
    icon: 'compress' as PdfToolIconKey,
    description: 'Reduce file size',
  },
  {
    label: 'Rotate PDF',
    href: '/tools/rotate-pdf',
    icon: 'rotate' as PdfToolIconKey,
    description: 'Fix page orientation',
  },
  {
    label: 'JPG to PDF',
    href: '/tools/jpg-to-pdf',
    icon: 'image' as PdfToolIconKey,
    description: 'Convert images to PDF',
  },
  {
    label: 'PDF to JPG',
    href: '/tools/pdf-to-jpg',
    icon: 'image' as PdfToolIconKey,
    description: 'Export pages as images',
  },
  {
    label: 'PDF to Word',
    href: '/tools/pdf-to-word',
    icon: 'word' as PdfToolIconKey,
    description: 'Convert to editable document',
  },
  {
    label: 'Protect PDF',
    href: '/tools/protect-pdf',
    icon: 'lock' as PdfToolIconKey,
    description: 'Add password protection',
  },
];

/** Named export — this is the symbol your page imports. */
export function EditPdfRelatedTools() {
  return (
    <section
      aria-labelledby="edit-pdf-related-heading"
      className="mx-auto w-full max-w-5xl"
    >
      <h2
        id="edit-pdf-related-heading"
        className="mb-4 text-xl font-semibold tracking-tight"
      >
        More PDF tools
      </h2>

      {/* Mobile: horizontal scroll. Desktop: 2- and 4-column grid. */}
      <div
        role="list"
        className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4"
      >
        {RELATED_TOOLS.map((tool) => {
          const Icon = PDF_TOOL_ICONS[tool.icon] as
            | React.ComponentType<{ className?: string }>
            | undefined;

          return (
            <Link
              key={tool.href}
              href={tool.href}
              role="listitem"
              className="group flex min-w-[240px] shrink-0 items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/60 hover:bg-accent/40 sm:min-w-0"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                {Icon ? (
                  <Icon className="h-4 w-4" />
                ) : (
                  <span aria-hidden className="text-[10px] font-semibold">
                    PDF
                  </span>
                )}
              </span>

              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {tool.label}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {tool.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}