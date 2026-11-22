import Link from "next/link";
import { ChevronRightIcon, HomeIcon } from "@/components/general/icons/pdf-icons";
import { TOOLS_INDEX_HREF } from "./protect-config";

const LINK_CLASSES =
  "inline-flex items-center gap-1.5 rounded-md outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";

export function ProtectBreadcrumb() {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <Link href="/" className={LINK_CLASSES}>
            <HomeIcon className="size-4" />
            Home
          </Link>
          <ChevronRightIcon className="size-3.5" />
        </li>
        <li className="flex items-center gap-1.5">
          <Link href={TOOLS_INDEX_HREF} className={LINK_CLASSES}>
            PDF Tools
          </Link>
          <ChevronRightIcon className="size-3.5" />
        </li>
        <li aria-current="page" className="font-semibold text-foreground">
          Protect PDF
        </li>
      </ol>
    </nav>
  );
}