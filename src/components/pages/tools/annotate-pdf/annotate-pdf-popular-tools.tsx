"use client";
// src/components/pages/tools/annotate-pdf/annotate-pdf-popular-tools.tsx
import Link from "next/link";
import { PDF_TOOL_ICONS, type PdfToolIconKey } from "@/components/general/icons/pdf-icons";

const POPULAR: { slug: PdfToolIconKey; href: string; label: string }[] = [
  { slug: "merge-pdf", href: "/tools/merge-pdf", label: "Merge PDF" },
  { slug: "split-pdf", href: "/tools/split-pdf", label: "Split PDF" },
  { slug: "compress-pdf", href: "/tools/compress-pdf", label: "Compress PDF" },
  { slug: "rotate-pdf", href: "/tools/rotate-pdf", label: "Rotate PDF" },
  { slug: "protect-pdf", href: "/tools/protect-pdf", label: "Protect PDF" },
  { slug: "unlock-pdf", href: "/tools/unlock-pdf", label: "Unlock PDF" },
  { slug: "edit-pdf", href: "/tools/edit-pdf", label: "Edit PDF" },
  { slug: "pdf-to-word", href: "/tools/pdf-to-word", label: "PDF to Word" },
  { slug: "pdf-to-jpg", href: "/tools/pdf-to-jpg", label: "PDF to JPG" },
  { slug: "jpg-to-pdf", href: "/tools/jpg-to-pdf", label: "JPG to PDF" },
];

export function AnnotatePdfPopularTools() {
  return (
    <section className="mt-10">
      <h2 className="text-center text-xl font-semibold">Popular PDF Tools</h2>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-5 sm:overflow-visible">
        {POPULAR.map((t) => {
          const Icon = PDF_TOOL_ICONS[t.slug];
          return (
            <Link
              key={t.slug}
              href={t.href}
              className="flex min-w-[120px] flex-col items-center gap-2 rounded-lg border border-border bg-card px-3 py-4 text-center text-xs font-medium hover:border-primary/60"
            >
              {Icon ? <Icon className="h-6 w-6 text-primary" /> : null}
              {t.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}