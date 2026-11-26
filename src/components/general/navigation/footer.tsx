import Image from "next/image";
import Link from "next/link";

import {
  ArrowRightIcon,
  ChevronDownIcon,
  GithubIcon,
  GlobeIcon,
  LinkedinIcon,
  XSocialIcon,
  YoutubeIcon,
} from "@/components/general/icons/pdf-icons";
import { CopyrightYear } from "@/components/general/navigation/copyright-year";

type FooterLink = { label: string; href: string; more?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "PDF Tools",
    links: [
      { label: "Merge PDF", href: "/tools/merge-pdf" },
      { label: "Split PDF", href: "/tools/split-pdf" },
      { label: "Compress PDF", href: "/tools/compress-pdf" },
      { label: "More Tools", href: "/tools", more: true },
    ],
  },
  {
    title: "AI Tools",
    links: [
      { label: "Chat with PDF", href: "/ai-tools/chat-with-pdf" },
      { label: "AI Summarizer", href: "/ai-tools/summarize-pdf" },
      { label: "AI Translator", href: "/ai-tools/translate-pdf" },
      { label: "More AI Tools", href: "/ai-tools", more: true },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookie-policy" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
  },
];

// TODO: replace the "#" placeholders with your real profile URLs.
const SOCIALS = [
  { label: "X (Twitter)", href: "#", icon: XSocialIcon },
  { label: "YouTube", href: "#", icon: YoutubeIcon },
  { label: "LinkedIn", href: "#", icon: LinkedinIcon },
  { label: "GitHub", href: "#", icon: GithubIcon },
];

export default function Footer() {
  return (
    <footer className="mt-12 w-full border-t border-border/60 bg-background pb-8 pt-10 sm:mt-16">
      {/* same centered width + horizontal padding as the root Container */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)_auto] lg:gap-8 xl:gap-12">
          {/* brand */}
          <div>
            <Link href="/" aria-label="PDFBerri home" className="inline-block">
              {/* logo.png has built-in whitespace, so pull it left to align with the content edge */}
              <Image
                src="/images/general/logo.png"
                alt="PDFBerri"
                width={216}
                height={72}
                className="-ml-3 h-14 w-auto dark:rounded-xl dark:bg-white dark:px-3"
              />
            </Link>
            <p className="mt-1 max-w-3xs text-sm text-muted-foreground">
              Smarter Tools. Bigger Possibilities.
            </p>
          </div>

          {/* link columns */}
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 md:gap-0 lg:divide-x lg:divide-border/60"
          >
            {COLUMNS.map(({ title, links }) => (
              <div key={title} className="md:px-6 md:first:pl-0 lg:first:pl-6">
                <h3 className="text-sm font-extrabold text-foreground">{title}</h3>
                <ul className="mt-3 space-y-2">
                  {links.map(({ label, href, more }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className={
                          more
                            ? "group inline-flex items-center gap-1 text-sm font-semibold text-primary"
                            : "text-sm text-muted-foreground transition-colors hover:text-primary"
                        }
                      >
                        {label}
                        {more && (
                          <ArrowRightIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* language + socials */}
          <div className="flex flex-col gap-5 lg:items-end">
            <div className="relative">
              <GlobeIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-foreground/70" />
              <select
                aria-label="Language"
                defaultValue="en"
                className="h-10 cursor-pointer appearance-none rounded-full border border-border bg-card/80 py-0 pl-10 pr-10 text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-primary"
              >
                <option value="en">English</option>
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-foreground/70" />
            </div>

            <ul className="flex items-center gap-2.5">
              {SOCIALS.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid size-9 place-items-center rounded-full bg-foreground text-background transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <Icon className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-8 text-xs text-muted-foreground lg:text-right">
          © <CopyrightYear /> PDFBerri. All rights reserved.
        </p>
      </div>
    </footer>
  );
}