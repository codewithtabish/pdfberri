import type { Metadata } from "next";
import { SplitPage } from "@/components/pages/tools/split-pdf/split-page";

const title = "Split PDF Files Online Free | PDFBerri";
const description =
  "Split PDF files into separate documents, extract selected pages, or divide PDFs by page ranges. Process your document directly in your browser with PDFBerri.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/tools/split-pdf" }, // resolved against metadataBase in your root layout
  openGraph: { title, description, url: "/tools/split-pdf", type: "website", siteName: "PDFBerri" },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export default function SplitPdfRoute() {
  return <SplitPage />;
}