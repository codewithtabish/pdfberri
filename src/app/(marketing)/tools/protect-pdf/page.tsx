import type { Metadata } from "next";
import { PROTECT_ROUTE } from "@/components/pages/tools/protect-pdf/protect-config";
import { ProtectPage } from "@/components/pages/tools/protect-pdf/protect-page";

const TITLE = "Protect PDF with a Password Online | PDFBerri";
const DESCRIPTION =
  "Add password protection to your PDF documents with PDFBerri. Encrypt your PDF locally in your browser using AES-256 password-based encryption.";

const OG_IMAGE = {
  url: "/images/protect-pdf/Secure_PDF_Shield_Orbit.webp",
  width: 2172,
  height: 724,
  alt: "A PDF document protected by a blue padlock shield",
};

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PROTECT_ROUTE },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PROTECT_ROUTE,
    type: "website",
    siteName: "PDFBerri",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default function ProtectPdfRoute() {
  return <ProtectPage />;
}