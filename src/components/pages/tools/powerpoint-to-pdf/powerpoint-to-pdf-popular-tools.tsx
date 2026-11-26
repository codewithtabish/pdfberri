import Link from "next/link";
import { ChevronRightIcon, PDF_TOOL_ICONS } from "@/components/general/icons/pdf-icons";
import { POPULAR_TOOLS } from "./powerpoint-to-pdf-constants";

export function PowerPointToPdfPopularTools() {
  return (
    <section aria-labelledby="popular-tools-heading" className="flex flex-col gap-3">
      <h2 id="popular-tools-heading" className="text-center text-lg font-bold text-foreground">
        Popular PDF Tools
      </h2>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {POPULAR_TOOLS.map(({ slug, label }) => {
          const Icon = PDF_TOOL_ICONS[slug];
          return (
            <li key={slug}>
              <Link
                href={`/tools/${slug}`}
                className="flex h-full flex-col items-center gap-1.5 rounded-xl border border-border bg-card px-2 py-3 text-center text-xs font-semibold text-foreground transition-colors hover:border-primary/50"
              >
                <Icon className="size-6 text-primary" />
                <span className="inline-flex items-center gap-0.5">
                  {label}
                  <ChevronRightIcon className="size-3 text-muted-foreground" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
