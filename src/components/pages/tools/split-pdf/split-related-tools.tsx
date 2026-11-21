import Link from "next/link";
import { SPLIT_RELATED_TOOLS, SPLIT_UI } from "./split-constants";
import { ArrowRightIcon } from "@/components/general/icons/pdf-icons";

export function SplitRelatedTools() {
  return (
    <section aria-labelledby="split-related-heading" className="space-y-6">
      <h2 id="split-related-heading" className="text-center text-2xl font-bold text-foreground">
        Related PDF tools
      </h2>
      <nav aria-label="Related PDF tools">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SPLIT_RELATED_TOOLS.map(({ title, description, href, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={`group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/50 hover:bg-primary/5 ${SPLIT_UI.focusRing}`}
              >
                <Icon className="size-6 shrink-0 text-primary" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-foreground">{title}</span>
                  <span className="block text-xs text-muted-foreground">{description}</span>
                </span>
                <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
