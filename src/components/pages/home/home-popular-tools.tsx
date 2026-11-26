"use client";

import * as React from "react";
import Link from "next/link";

import {
  AnnotateIcon,
  ArrowRightIcon,
  CompressIcon,
  ExcelIcon,
  HtmlIcon,
  ImageIcon,
  MergeIcon,
  OcrIcon,
  OrganizeIcon,
  PageNumbersIcon,
  PageSelectIcon,
  PdfToJpgIcon,
  PowerpointIcon,
  ProtectIcon,
  RotateIcon,
  SignIcon,
  SplitIcon,
  TextFileIcon,
  TrashIcon,
  UnlockIcon,
  WatermarkIcon,
  WordIcon,
} from "@/components/general/icons/pdf-icons";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* data                                                                */
/* ------------------------------------------------------------------ */

type IconType = React.ComponentType<{ className?: string }>;
type Tone = "blue" | "violet" | "green" | "orange" | "red";
type Category = "convert" | "edit" | "organize" | "secure" | "more";

const TONES: Record<Tone, string> = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  red: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const FEATURED: {
  title: string;
  desc: string;
  href: string;
  icon: IconType;
  tone: Tone;
}[] = [
  { title: "Merge PDF", desc: "Combine multiple PDFs", href: "/tools/merge-pdf", icon: MergeIcon, tone: "blue" },
  { title: "Split PDF", desc: "Separate pages", href: "/tools/split-pdf", icon: SplitIcon, tone: "violet" },
  { title: "Compress PDF", desc: "Reduce file size", href: "/tools/compress-pdf", icon: CompressIcon, tone: "green" },
  { title: "PDF to Word", desc: "Convert to editable doc", href: "/tools/pdf-to-word", icon: WordIcon, tone: "blue" },
  { title: "Word to PDF", desc: "Turn Word into PDF", href: "/tools/word-to-pdf", icon: WordIcon, tone: "blue" },
  { title: "PDF to Excel", desc: "Extract data tables", href: "/tools/pdf-to-excel", icon: ExcelIcon, tone: "green" },
  { title: "PowerPoint to PDF", desc: "Convert slides", href: "/tools/powerpoint-to-pdf", icon: PowerpointIcon, tone: "orange" },
  { title: "PDF to PowerPoint", desc: "Get PPT from PDF", href: "/tools/pdf-to-powerpoint", icon: PowerpointIcon, tone: "orange" },
];

const TOOLS: {
  label: string;
  href: string;
  icon: IconType;
  tone: Tone;
  category: Category;
}[] = [
  { label: "Rotate PDF", href: "/tools/rotate-pdf", icon: RotateIcon, tone: "blue", category: "edit" },
  { label: "Protect PDF", href: "/tools/protect-pdf", icon: ProtectIcon, tone: "blue", category: "secure" },
  { label: "Unlock PDF", href: "/tools/unlock-pdf", icon: UnlockIcon, tone: "blue", category: "secure" },
  { label: "Add Page Numbers", href: "/tools/add-page-numbers", icon: PageNumbersIcon, tone: "orange", category: "edit" },
  { label: "Add Watermark", href: "/tools/add-watermark", icon: WatermarkIcon, tone: "blue", category: "edit" },
  { label: "Annotate PDF", href: "/tools/annotate-pdf", icon: AnnotateIcon, tone: "blue", category: "edit" },
  { label: "Sign PDF", href: "/tools/sign-pdf", icon: SignIcon, tone: "blue", category: "edit" },
  { label: "Extract Pages", href: "/tools/extract-pages", icon: PageSelectIcon, tone: "blue", category: "organize" },
  { label: "Delete Pages", href: "/tools/delete-pages", icon: TrashIcon, tone: "red", category: "organize" },
  { label: "Rearrange Pages", href: "/tools/rearrange-pages", icon: OrganizeIcon, tone: "blue", category: "organize" },
  { label: "OCR PDF", href: "/tools/ocr-pdf", icon: OcrIcon, tone: "blue", category: "more" },
  { label: "Extract Text", href: "/tools/extract-text", icon: TextFileIcon, tone: "blue", category: "more" },
  { label: "Extract Images", href: "/tools/extract-images", icon: ImageIcon, tone: "green", category: "more" },
  { label: "HTML to PDF", href: "/tools/html-to-pdf", icon: HtmlIcon, tone: "blue", category: "convert" },
  { label: "JPG to PDF", href: "/tools/jpg-to-pdf", icon: ImageIcon, tone: "orange", category: "convert" },
  { label: "PDF to JPG", href: "/tools/pdf-to-jpg", icon: PdfToJpgIcon, tone: "blue", category: "convert" },
];

const TABS: { id: "all" | Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "convert", label: "Convert" },
  { id: "edit", label: "Edit" },
  { id: "organize", label: "Organize" },
  { id: "secure", label: "Secure" },
  { id: "more", label: "More" },
];

/* ------------------------------------------------------------------ */
/* section                                                             */
/* ------------------------------------------------------------------ */

export function HomePopularTools() {
  const [tab, setTab] = React.useState<"all" | Category>("all");

  const visible = tab === "all" ? TOOLS : TOOLS.filter((t) => t.category === tab);

  return (
    <section aria-labelledby="popular-tools-heading" className="mt-6 sm:mt-8">
      {/* heading row */}
      <div className="flex items-center justify-between gap-4">
      <h2
  id="popular-tools-heading"
  className="text-2xl font-extrabold italic tracking-tight text-foreground sm:text-3xl"
>
  <span className="relative inline-block pb-2">
    Popular PDF Tools
    {/* gradient underline */}
    <span
      aria-hidden="true"
      className="absolute bottom-0 left-0 h-1.5 w-full rounded-full bg-linear-to-r from-primary via-violet-500 to-transparent"
    />
    {/* thin accent line */}
    <span
      aria-hidden="true"
      className="absolute -bottom-1.5 left-0 h-0.5 w-1/2 rounded-full bg-primary/40"
    />
  </span>
</h2>
        <Link
          href="/tools"
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
        >
          View all tools
          <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* featured tools */}
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {FEATURED.map(({ title, desc, href, icon: Icon, tone }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex items-center gap-3.5 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 focus-visible:outline-2 focus-visible:outline-primary"
            >
              <span
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-xl",
                  TONES[tone],
                )}
              >
                <Icon className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-bold text-foreground">
                  {title}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {desc}
                </span>
              </span>
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                <ArrowRightIcon className="size-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* category tabs */}
      <div className="mt-7 flex justify-center">
        <div
          role="tablist"
          aria-label="Filter tools by category"
          className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-border/60 bg-card/80 p-1 shadow-sm backdrop-blur scrollbar-none"
        >
          {TABS.map(({ id, label }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(id)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                    : "text-foreground/70 hover:bg-primary/10 hover:text-foreground",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* compact tools grid */}
      <ul
        role="tabpanel"
        className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8"
      >
        {visible.map(({ label, href, icon: Icon, tone }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex h-full items-center gap-2.5 rounded-xl border border-border/60 bg-card/80 px-3 py-3 text-[13px] font-semibold leading-tight text-foreground/90 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:text-foreground hover:shadow-md hover:shadow-primary/10 focus-visible:outline-2 focus-visible:outline-primary"
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-lg transition-transform duration-200 group-hover:scale-110",
                  TONES[tone],
                )}
              >
                <Icon className="size-[18px]" />
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}