import Link from "next/link";
import { ChevronRightIcon, HomeIcon } from "@/components/general/icons/pdf-icons";

export function JpgToPdfBreadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="pt-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <li>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <HomeIcon className="size-4" />
            <span>Home</span>
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRightIcon className="size-3.5" />
        </li>
        <li>
          <Link
            href="/tools"
            className="rounded-md hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Tools
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRightIcon className="size-3.5" />
        </li>
        <li aria-current="page" className="font-medium text-foreground">
          JPG to PDF
        </li>
      </ol>
    </nav>
  );
}
