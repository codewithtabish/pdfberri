import Link from "next/link";
import { SplitFaq } from "./split-faq";
import { SplitFeatures } from "./split-features";
import { SplitHowItWorks } from "./split-how-it-works";
import { SplitRelatedTools } from "./split-related-tools";
import { SplitWorkspace } from "./split-workspace";

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "/" },
    { "@type": "ListItem", position: 2, name: "PDF Tools", item: "/tools" },
    { "@type": "ListItem", position: 3, name: "Split PDF", item: "/tools/split-pdf" },
  ],
};

/**
 * Server Component. No page-level horizontal padding or background: the shared
 * Container from RootLayout owns those. If your RootLayout already renders a
 * <main>, change the outer <main> below to a <div> to avoid nesting.
 */
export function SplitPage() {
  return (
    <main className="flex flex-col gap-14 py-6 sm:gap-16 sm:py-10">
      <header className="space-y-4 text-center">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-foreground">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/tools" className="hover:text-foreground">PDF Tools</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-foreground">Split PDF</li>
          </ol>
        </nav>
        <p className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          Free online PDF tool
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Split PDF Files</h1>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
          Separate PDF pages into individual documents or extract exactly the pages you need.
        </p>
      </header>

      <SplitWorkspace />
      <SplitHowItWorks />
      <SplitFeatures />
      <SplitFaq />
      <SplitRelatedTools />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />
    </main>
  );
}
