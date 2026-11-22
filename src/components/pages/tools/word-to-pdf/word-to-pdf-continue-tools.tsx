// src/components/pages/tools/word-to-pdf/word-to-pdf-continue-tools.tsx

import Link from "next/link";

import {
  ArrowRightIcon,
  CompressIcon,
  MergeIcon,
  ProtectIcon,
  RotateIcon,
  SplitIcon,
  WordIcon,
} from "@/components/general/icons/pdf-icons";

import { NEXT_TOOLS, type NextToolLink } from "./word-to-pdf-constants";

const ICONS: Record<NextToolLink["icon"], typeof WordIcon> = {
  word: WordIcon,
  compress: CompressIcon,
  merge: MergeIcon,
  protect: ProtectIcon,
  split: SplitIcon,
  rotate: RotateIcon,
};

export function WordToPdfContinueTools() {
  return (
    <section aria-labelledby="word-to-pdf-continue-heading" className="space-y-4">
      <h2 id="word-to-pdf-continue-heading" className="text-xl font-bold tracking-tight">
        Continue working with your document
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {NEXT_TOOLS.map((tool) => {
          const Icon = ICONS[tool.icon];
          return (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="group flex h-full items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">{tool.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {tool.description}
                  </span>
                </span>
                <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
