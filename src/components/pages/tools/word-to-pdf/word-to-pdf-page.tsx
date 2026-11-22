// src/components/pages/tools/word-to-pdf/word-to-pdf-page.tsx
//
// Server Component. No page-level horizontal padding or background:
// the shared Container owns those.

import { WordToPdfBreadcrumb } from "./word-to-pdf-breadcrumb";
import { WordToPdfCompatibility } from "./word-to-pdf-compatibility";
import {
  TOOLS_INDEX_ROUTE,
  WORD_TO_PDF_DESCRIPTION,
  WORD_TO_PDF_ROUTE,
} from "./word-to-pdf-constants";
import { WordToPdfContinueTools } from "./word-to-pdf-continue-tools";
import { WordToPdfFaq, WORD_TO_PDF_FAQS } from "./word-to-pdf-faq";
import { WordToPdfFeatures } from "./word-to-pdf-features";
import { WordToPdfFormats } from "./word-to-pdf-formats";
import { WordToPdfHero } from "./word-to-pdf-hero";
import { WordToPdfHowItWorks } from "./word-to-pdf-how-it-works";
import { WordToPdfPrivacyNote } from "./word-to-pdf-privacy-note";
import { WordToPdfRelatedTools } from "./word-to-pdf-related-tools";
import { WordToPdfWorkspace } from "./word-to-pdf-workspace";

function buildJsonLd() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const abs = (path: string) => (base ? `${base}${path}` : undefined);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "PDFBerri Word to PDF",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        description: WORD_TO_PDF_DESCRIPTION,
        url: abs(WORD_TO_PDF_ROUTE),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
          { "@type": "ListItem", position: 2, name: "Tools", item: abs(TOOLS_INDEX_ROUTE) },
          { "@type": "ListItem", position: 3, name: "Word to PDF", item: abs(WORD_TO_PDF_ROUTE) },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: WORD_TO_PDF_FAQS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };
}

export function WordToPdfPage() {
  const jsonLd = JSON.stringify(buildJsonLd()).replace(/</g, "\\u003c");

  return (
    <div className="flex flex-col gap-8 pb-16 pt-4 sm:gap-10">
      <WordToPdfBreadcrumb />
      <WordToPdfHero />
      <WordToPdfWorkspace />
      <WordToPdfPrivacyNote />
      <WordToPdfContinueTools />

      <div className="grid gap-4 lg:grid-cols-3">
        <WordToPdfHowItWorks />
        <WordToPdfFeatures />
        <WordToPdfFormats />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <WordToPdfFaq />
        <WordToPdfCompatibility />
        <WordToPdfRelatedTools />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
    </div>
  );
}
