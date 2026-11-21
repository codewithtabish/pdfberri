// app/tools/compress-pdf/page.tsx

import type { Metadata } from "next";
import { CompressPage } from "@/components/pages/tools/pdf-compress/compress-page";

const PAGE_TITLE = "Compress PDF Online | Reduce PDF File Size | PDFBerri";
const PAGE_DESCRIPTION =
  "Compress PDF files with flexible quality settings. Reduce document size while balancing image quality, readability, and file performance with PDFBerri.";
const PAGE_PATH = "/tools/compress-pdf";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_PATH,
    siteName: "PDFBerri",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CompressPdfRoute() {
  return <CompressPage />;
}