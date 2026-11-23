"use client";

import Link from "next/link";
import { POPULAR_TOOLS } from "./html-to-pdf-constants";
import { PDF_TOOL_ICONS } from "@/components/general/icons/pdf-icons";

export function HtmlToPdfPopularTools() {
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-center text-lg font-semibold">Popular Tools</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {POPULAR_TOOLS.map((tool) => {
          const Icon = PDF_TOOL_ICONS[tool.iconKey as keyof typeof PDF_TOOL_ICONS];
          return (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="flex min-w-[88px] flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 text-center transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted/60">
                {Icon ? <Icon className="size-5" /> : <span className="text-xs font-bold">{tool.name.slice(0, 2)}</span>}
              </div>
              <span className="text-xs font-medium leading-tight">{tool.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
