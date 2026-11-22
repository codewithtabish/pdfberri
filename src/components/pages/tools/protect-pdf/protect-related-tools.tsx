import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowRightIcon,
  CompressIcon,
  MergeIcon,
  RotateIcon,
  SplitIcon,
} from "@/components/general/icons/pdf-icons";
import { RELATED_TOOLS } from "./protect-config";
import { Reveal } from "./protect-motion";

type ToolIconKey = (typeof RELATED_TOOLS)[number]["icon"];

const TOOL_ICONS: Record<ToolIconKey, ComponentType<{ className?: string }>> = {
  merge: MergeIcon,
  split: SplitIcon,
  compress: CompressIcon,
  rotate: RotateIcon,
};

export function ProtectRelatedTools() {
  return (
    <Reveal>
      <section aria-labelledby="protect-related-heading" className="flex flex-col gap-4">
        <h2 id="protect-related-heading" className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
          Related PDF tools
        </h2>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {RELATED_TOOLS.map((tool) => {
            const Icon = TOOL_ICONS[tool.icon];
            return (
              <li key={tool.href}>
                <Link
                  href={tool.href}
                  className="group flex h-full items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-bold text-foreground">{tool.title}</span>
                    <span className="text-xs text-muted-foreground">{tool.description}</span>
                  </span>
                  <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </Reveal>
  );
}