"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  ArrowRightIcon,
  ChevronDownIcon,
  CloseIcon,
  FileIcon,
  MenuIcon,
  SparkleIcon,
} from "@/components/general/icons/pdf-icons";
import { cn } from "@/lib/utils";
import { NAV_GROUPS, NavGroup } from "@/data/nav-items";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const isViewAll = (label: string) => label.toLowerCase().startsWith("view all");

/** Soft colour tile per link, so the menus feel like the landing design. */
function toneFor(label: string) {
  const l = label.toLowerCase();
  if (l.includes("word")) return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
  if (l.includes("excel")) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  if (l.includes("powerpoint") || l.includes("ppt")) return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
  if (l.includes("jpg") || l.includes("image")) return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  if (l.includes("html")) return "bg-violet-500/10 text-violet-600 dark:text-violet-400";
  return "bg-primary/10 text-primary";
}

function LinkTile({ group, label }: { group: NavGroup; label: string }) {
  const Icon = group.label === "AI Tools" ? SparkleIcon : FileIcon;
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-lg transition-transform duration-200 group-hover/item:scale-110",
        group.label === "AI Tools"
          ? "bg-linear-to-br from-primary/15 to-violet-500/15 text-primary"
          : toneFor(label),
      )}
    >
      <Icon className="size-4" />
    </span>
  );
}

function isGroupActive(group: NavGroup, pathname: string) {
  return group.links.some(
    (l) =>
      !isViewAll(l.label) &&
      (pathname === l.href || pathname.startsWith(l.href + "/")),
  );
}

/* ------------------------------------------------------------------ */
/* desktop dropdown                                                    */
/* ------------------------------------------------------------------ */

function DesktopItem({ group, pathname }: { group: NavGroup; pathname: string }) {
  const active = isGroupActive(group, pathname);
  const items = group.links.filter((l) => !isViewAll(l.label));
  const footer = group.links.find((l) => isViewAll(l.label));

  return (
    <li className="group relative">
      <Link
        href={group.href}
        className={cn(
          "flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold transition-colors",
          "text-foreground/70 hover:bg-primary/10 hover:text-foreground group-focus-within:bg-primary/10 group-focus-within:text-foreground",
          active && "text-primary",
        )}
      >
        {group.label}
        <ChevronDownIcon className="size-3.5 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
      </Link>

      {/* panel — pt-3 bridges the hover gap so the menu doesn't close */}
      <div
        className={cn(
          "invisible absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 translate-y-1 pt-3 opacity-0",
          "transition-all duration-200 ease-out",
          "group-hover:visible group-hover:translate-y-0 group-hover:opacity-100",
          "group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100",
        )}
      >
        <div className="relative rounded-2xl border border-border/70 bg-popover/95 p-2 shadow-2xl shadow-primary/10 backdrop-blur-xl">
          <span
            aria-hidden="true"
            className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 rounded-sm border-l border-t border-border/70 bg-popover"
          />
          <ul className="relative">
            {items.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "group/item flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors",
                    "text-foreground/80 hover:bg-primary/8 hover:text-foreground",
                    pathname === link.href && "bg-primary/10 text-primary",
                  )}
                >
                  <LinkTile group={group} label={link.label} />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {footer && (
            <Link
              href={footer.href}
              className="group/item relative mt-1 flex items-center justify-between rounded-xl border-t border-border/60 px-3 pb-2 pt-3 text-sm font-semibold text-primary"
            >
              {footer.label}
              <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover/item:translate-x-1" />
            </Link>
          )}
        </div>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* mobile accordion                                                    */
/* ------------------------------------------------------------------ */

function MobileItem({
  group,
  open,
  onToggle,
}: {
  group: NavGroup;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="border-b border-border/50 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-2 py-3.5 text-left text-base font-semibold text-foreground"
      >
        {group.label}
        <ChevronDownIcon
          className={cn("size-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <ul className="overflow-hidden">
          {group.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                tabIndex={open ? 0 : -1}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-medium",
                  isViewAll(link.label)
                    ? "font-semibold text-primary"
                    : "text-foreground/80 active:bg-primary/10",
                )}
              >
                {isViewAll(link.label) ? (
                  <ArrowRightIcon className="size-4" />
                ) : (
                  <LinkTile group={group} label={link.label} />
                )}
                {link.label}
              </Link>
            </li>
          ))}
          <li className="h-2" aria-hidden="true" />
        </ul>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* navbar                                                              */
/* ------------------------------------------------------------------ */

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openGroup, setOpenGroup] = React.useState<string | null>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the mobile menu after navigating
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-2 z-50">
      <nav
        aria-label="Main"
        className={cn(
          "relative flex items-center justify-between gap-3 rounded-2xl border bg-background/70 px-3 py-2 backdrop-blur-xl transition-all duration-300 sm:px-4",
          scrolled
            ? "border-border shadow-lg shadow-primary/10"
            : "border-border/50 shadow-sm shadow-primary/5",
        )}
      >
        {/* logo */}
        <Link
          href="/"
          className="flex items-center rounded-lg"
          aria-label="PDFBerri home"
        >
          <Image
            src="/images/general/logo.png"
            alt="PDFBerri"
            width={160}
            height={40}
            className="h-9 w-auto"
            priority
          />
        </Link>

        {/* desktop links */}
        <ul className="hidden items-center gap-0.5 xl:flex">
          {NAV_GROUPS.map((group) => (
            <DesktopItem key={group.label} group={group} pathname={pathname} />
          ))}
        </ul>

        {/* actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* <ThemeToggle /> */}
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-primary/10 hover:text-foreground sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href="/tools"
            className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40 active:translate-y-0 sm:px-5"
          >
            Get Started
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="grid size-10 place-items-center rounded-full text-foreground transition-colors hover:bg-primary/10 xl:hidden"
          >
            {mobileOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>

        {/* mobile panel */}
        <div
          className={cn(
            "absolute inset-x-0 top-full mt-2 origin-top rounded-2xl border border-border/70 bg-background/95 p-3 shadow-2xl shadow-primary/10 backdrop-blur-xl transition-all duration-200 xl:hidden",
            mobileOpen
              ? "visible translate-y-0 scale-100 opacity-100"
              : "invisible -translate-y-2 scale-95 opacity-0",
          )}
        >
          <ul className="max-h-[70vh] overflow-y-auto">
            {NAV_GROUPS.map((group) => (
              <MobileItem
                key={group.label}
                group={group}
                open={openGroup === group.label}
                onToggle={() =>
                  setOpenGroup((cur) => (cur === group.label ? null : group.label))
                }
              />
            ))}
          </ul>
          <Link
            href="/login"
            className="mt-3 flex justify-center rounded-full border border-border py-2.5 text-sm font-semibold text-foreground sm:hidden"
          >
            Log in
          </Link>
        </div>
      </nav>
    </header>
  );
}