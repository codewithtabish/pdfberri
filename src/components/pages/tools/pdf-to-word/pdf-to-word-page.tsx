// src/components/pages/tools/pdf-to-word/pdf-to-word-page.tsx

import Link from "next/link";
import { HomeIcon, ProtectIcon } from "@/components/general/icons/pdf-icons";
import { FAQ_ITEMS, PDF_TO_WORD_ROUTE } from "./pdf-to-word-constants";
import { PdfToWordDocumentTypes } from "./pdf-to-word-document-types";
import { PdfToWordFaq } from "./pdf-to-word-faq";
import { PdfToWordFeatures } from "./pdf-to-word-features";
import { PdfToWordHowItWorks } from "./pdf-to-word-how-it-works";
import { PdfToWordRelatedTools } from "./pdf-to-word-related-tools";
import { PdfToWordWorkspace } from "./pdf-to-word-workspace";

const DESCRIPTION =
  "Convert PDF documents into editable Word files while preserving their structure and formatting wherever possible.";

function jsonLd() {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const abs = (path: string) => (site ? `${site}${path}` : undefined);

  return JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "PDF to Word Converter",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      description: DESCRIPTION,
      url: abs(PDF_TO_WORD_ROUTE),
      browserRequirements: "Requires JavaScript",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
        { "@type": "ListItem", position: 2, name: "Convert PDF", item: abs("/tools") },
        { "@type": "ListItem", position: 3, name: "PDF to Word" },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ]).replace(/</g, "\\u003c");
}

export function PdfToWordPage() {
  return (
    <main className="flex flex-col gap-12 pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd() }}
      />

      <header className="flex flex-col gap-4 pt-4">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <HomeIcon className="size-4 text-primary" />
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <Link href="/tools" className="hover:text-foreground">
                Convert PDF
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="font-medium text-foreground">
              PDF to Word
            </li>
          </ol>
        </nav>

        <p className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          PDF conversion tool
        </p>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          PDF to Word <span className="text-primary">Converter</span>
        </h1>
        <p className="max-w-3xl text-lg text-muted-foreground">{DESCRIPTION}</p>
        <p className="flex items-center gap-2 text-sm font-medium">
          <ProtectIcon className="size-5 text-primary" />
          Simple workflow. Thoughtful conversion. Your documents handled with
          care.
        </p>
      </header>

      <PdfToWordWorkspace />
      <PdfToWordFeatures />
      <PdfToWordHowItWorks />
      <PdfToWordDocumentTypes />

      <div className="grid gap-8 lg:grid-cols-2">
        <PdfToWordFaq />
        <PdfToWordRelatedTools />
      </div>
    </main>
  );
}