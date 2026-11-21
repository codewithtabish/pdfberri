import Link from "next/link";
import { ChevronDown, FileText, Search } from "lucide-react";
import MobileMenu from "./mobile-menu";
import { NAV_GROUPS } from "@/data/nav-items";

export default function Navbar() {
  return (
    <header className="relative z-40 flex h-16 items-center justify-between gap-4 sm:h-[72px]">
      <Link
        href="/"
        aria-label="PDFBerri home"
        className="flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <FileText aria-hidden="true" className="size-5" />
        </span>
        <span className="text-xl font-extrabold tracking-tight text-foreground">
          PDFBerri
        </span>
      </Link>

      {/* Desktop navigation: dropdowns open on hover and keyboard focus, no JavaScript needed */}
      <nav aria-label="Main" className="hidden lg:block">
        <ul className="flex items-center gap-1">
          {NAV_GROUPS.map((group) => (
            <li key={group.label} className="group relative">
              <Link
                href={group.href}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {group.label}
                <ChevronDown
                  aria-hidden="true"
                  className="size-3.5 text-muted-foreground transition-transform group-hover:rotate-180 group-focus-within:rotate-180"
                />
              </Link>

              <div className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <ul className="min-w-56 rounded-xl border border-border bg-card p-1.5 shadow-lg">
                  {group.links.map((link) => (
                    <li key={`${group.label}-${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-2">
        <Link
          href="/tools"
          aria-label="Search PDF tools"
          className="inline-flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Search aria-hidden="true" className="size-5" />
        </Link>

        <Link
          href="/sign-in"
          className="hidden h-10 items-center rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
        >
          Sign In
        </Link>

        <Link
          href="/tools"
          className="hidden h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
        >
          Get Started
        </Link>

        <MobileMenu groups={NAV_GROUPS} />
      </div>
    </header>
  );
}