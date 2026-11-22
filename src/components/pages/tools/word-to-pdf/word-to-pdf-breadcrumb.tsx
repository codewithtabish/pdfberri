// src/components/pages/tools/word-to-pdf/word-to-pdf-breadcrumb.tsx

import Link from "next/link";

import { ChevronRightIcon, HomeIcon } from "@/components/general/icons/pdf-icons";

import { TOOLS_INDEX_ROUTE } from "./word-to-pdf-constants";

export function WordToPdfBreadcrumb() {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <li>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            <HomeIcon className="size-4" />
            Home
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRightIcon className="size-4" />
        </li>
        <li>
          <Link
            href={TOOLS_INDEX_ROUTE}
            className="rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            Tools
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRightIcon className="size-4" />
        </li>
        <li aria-current="page" className="font-semibold text-foreground">
          Word to PDF
        </li>
      </ol>
    </nav>
  );
}
