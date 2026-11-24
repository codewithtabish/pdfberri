import Link from "next/link";
import { POPULAR_TOOLS } from "./html-to-pdf-constants";
import {
  PDF_TOOL_ICONS,
  type PdfToolIconKey,
} from "@/components/general/icons/pdf-icons";

/* Full class names are written out so Tailwind keeps them. */
const TONES = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  red: "bg-red-500/10 text-red-600 dark:text-red-400",
} as const;

type Tone = keyof typeof TONES;

const TOOL_TONE: Record<string, Tone> = {
  "html-to-pdf": "blue",
  "pdf-to-word": "blue",
  "word-to-pdf": "blue",
  "pdf-to-excel": "green",
  "excel-to-pdf": "green",
  "jpg-to-pdf": "orange",
  "pdf-to-jpg": "violet",
  "merge-pdf": "blue",
  "split-pdf": "violet",
  "compress-pdf": "red",
  "protect-pdf": "green",
};

export function HtmlToPdfPopularTools() {
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-center text-lg font-semibold">Popular Tools</h2>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {POPULAR_TOOLS.map((tool) => {
          // Look up by SLUG (this is how PDF_TOOL_ICONS is keyed)
          const Icon = PDF_TOOL_ICONS[tool.slug as PdfToolIconKey];
          const tone = TONES[TOOL_TONE[tool.slug] ?? "blue"];

          return (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="flex min-w-[88px] shrink-0 flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 text-center transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              <div
                className={`flex size-10 items-center justify-center rounded-lg ${tone}`}
              >
                {Icon ? (
                  <Icon className="size-5" />
                ) : (
                  <span className="text-xs font-bold">
                    {tool.name.slice(0, 2)}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium leading-tight">
                {tool.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}