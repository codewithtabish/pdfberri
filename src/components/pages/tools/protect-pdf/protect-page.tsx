import { PROTECT_FAQS, PROTECT_ROUTE, SITE_URL, TOOLS_INDEX_HREF } from "./protect-config";
import { ProtectBreadcrumb } from "./protect-breadcrumb";
import { ProtectEncryptionNote } from "./protect-encryption-note";
import { ProtectFaq } from "./protect-faq";
import { ProtectHero } from "./protect-hero";
import { ProtectHowItWorks } from "./protect-how-it-works";
import { ProtectPrivacyNote } from "./protect-privacy-note";
import { ProtectRelatedTools } from "./protect-related-tools";
import { ProtectWorkspace } from "./protect-workspace";

function buildStructuredData() {
  const pageUrl = `${SITE_URL}${PROTECT_ROUTE}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${pageUrl}#app`,
        name: "PDFBerri Protect PDF",
        url: pageUrl,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any modern web browser",
        browserRequirements: "Requires JavaScript and WebAssembly",
        description: "Add an open password to a PDF using AES-256 encryption, processed locally in your browser.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "PDF Tools", item: `${SITE_URL}${TOOLS_INDEX_HREF}` },
          { "@type": "ListItem", position: 3, name: "Protect PDF", item: pageUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: PROTECT_FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };
}

/**
 * Starts directly inside the shared Container: no page-level horizontal padding or background.
 * Your RootLayout is assumed to provide <main>.
 */
export function ProtectPage() {
  const structuredData = JSON.stringify(buildStructuredData()).replace(/</g, "\\u003c");

  return (
    <div className="flex flex-col gap-10 pb-8 sm:gap-14 lg:gap-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />

      <div className="flex flex-col gap-6">
        <ProtectBreadcrumb />
        <ProtectHero />
      </div>

      <ProtectWorkspace />
      <ProtectEncryptionNote />

      <div className="grid gap-6 xl:grid-cols-2">
        <ProtectPrivacyNote />
        <ProtectHowItWorks />
      </div>

      <ProtectFaq />
      <ProtectRelatedTools />
    </div>
  );
}