import Link from "next/link";
import { MergeFaq } from "./merge-faq";
import { MergeFeatures } from "./merge-features";
import { MergeHowItWorks } from "./merge-how-it-works";
import { MergeRelatedTools } from "./merge-related-tools";
import { MergeWorkspace } from "./merge-workspace";

export default function MergePdfPage() {
  return (
    <>
      <nav aria-label="Breadcrumb" className="pt-4">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-foreground/65">
          <li>
            <Link
              href="/"
              className="hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/tools"
              className="hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              PDF Tools
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-semibold text-foreground">
            Merge PDF
          </li>
        </ol>
      </nav>

      <header className="mx-auto max-w-3xl py-8 text-center sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Free online PDF tool
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem]">
          Merge PDF Files
        </h1>
        <p className="mt-3 text-base leading-relaxed text-foreground/70">
          Combine multiple PDF documents into one organized file. Arrange your
          documents in the order you want and download your merged PDF directly
          to your device.
        </p>
      </header>

      <MergeWorkspace />
      <MergeHowItWorks />
      <MergeFeatures />
      <MergeFaq />
      <MergeRelatedTools />
    </>
  );
}