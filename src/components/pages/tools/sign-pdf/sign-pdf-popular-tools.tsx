"use client";
import Link from "next/link";
import { PDF_TOOL_ICONS } from "@/components/general/icons/pdf-icons";
export function SignPdfPopularTools() {
  const tools = [
    { slug: "merge-pdf", href: "/tools/merge-pdf", label: "Merge PDF" },
    { slug: "split-pdf", href: "/tools/split-pdf", label: "Split PDF" },
    { slug: "compress-pdf", href: "/tools/compress-pdf", label: "Compress PDF" },
    { slug: "rotate-pdf", href: "/tools/rotate-pdf", label: "Rotate PDF" },
    { slug: "protect-pdf", href: "/tools/protect-pdf", label: "Protect PDF" },
    { slug: "unlock-pdf", href: "/tools/unlock-pdf", label: "Unlock PDF" },
    { slug: "edit-pdf", href: "/tools/edit-pdf", label: "Edit PDF" },
  ] as const;
  return (
    <section className="mt-10">
      <h2 className="text-center text-xl font-semibold">Popular PDF Tools</h2>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-5 sm:overflow-visible">
        {tools.map((t) => {
          const Icon = PDF_TOOL_ICONS[t.slug as keyof typeof PDF_TOOL_ICONS];
          return (
            <Link key={t.slug} href={t.href} className="flex min-w-[100px] flex-col items-center gap-2 rounded-lg border border-border bg-card px-3 py-4 text-center text-xs font-medium hover:border-primary/60">
              {Icon && <Icon className="h-6 w-6 text-primary" />}
              {t.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}