import type { Metadata } from "next";
import { JpgToPdfPage } from "@/components/pages/tools/jpg-to-pdf/jpg-to-pdf-page";
import { JPG_TO_PDF_FAQS } from "@/components/pages/tools/jpg-to-pdf/jpg-to-pdf-config";

const TITLE = "JPG to PDF Converter – Convert Images to PDF Free | PDFBerri";
const DESCRIPTION =
  "Convert JPG and JPEG images into a PDF online with PDFBerri. Arrange images, choose page size and orientation, customize margins, and download your PDF.";
const PATH = "/tools/jpg-to-pdf";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    siteName: "PDFBerri",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PDFBerri JPG to PDF Converter",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (web browser)",
    description: DESCRIPTION,
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: JPG_TO_PDF_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  },
];

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <JpgToPdfPage />
    </>
  );
}