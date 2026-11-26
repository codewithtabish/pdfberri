import Link from "next/link";
import {
  ArrowRightIcon,
  CompressPdfIcon,
  ExcelToPdfIcon,
  MergePdfIcon,
  PdfToExcelIcon,
  PdfToJpgIcon,
  PdfToWordIcon,
  SplitPdfIcon,
  WordToPdfIcon,
} from "@/components/general/icons/pdf-icons";
import { POPULAR_TOOLS } from "./pdf-to-powerpoint-constants";

const ICONS = {
  merge: MergePdfIcon,
  split: SplitPdfIcon,
  compress: CompressPdfIcon,
  "pdf-to-word": PdfToWordIcon,
  "word-to-pdf": WordToPdfIcon,
  "pdf-to-excel": PdfToExcelIcon,
  "excel-to-pdf": ExcelToPdfIcon,
  "pdf-to-jpg": PdfToJpgIcon,
} as const;

export function PdfToPowerpointPopularTools() {
  return (
    <section aria-labelledby="popular-pdf-tools" className="flex flex-col gap-4">
      <h2 id="popular-pdf-tools" className="text-center text-xl font-bold text-foreground">
        Popular PDF Tools
      </h2>
      <ul className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-8 lg:overflow-visible">
        {POPULAR_TOOLS.map((tool) => {
          const Icon = ICONS[tool.id];
          return (
            <li key={tool.id} className="min-w-32 flex-1 lg:min-w-0">
              <Link
                href={tool.href}
                className="flex h-full flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 text-center text-xs font-semibold text-foreground transition-colors hover:border-primary/50"
              >
                <Icon className="size-7 text-primary" />
                <span className="flex items-center gap-1">
                  {tool.label}
                  <ArrowRightIcon className="size-3" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
