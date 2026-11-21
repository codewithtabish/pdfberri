import MergePdfPage from "@/components/pages/tools/merger/merge-page";
import type { Metadata } from "next";

const TITLE = "Merge PDF Files Online Free | PDFBerri";
const DESCRIPTION =
  "Merge multiple PDF files into one document. Arrange your PDFs, combine pages, and download the result directly from your browser with PDFBerri.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/tools/merge-pdf" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/tools/merge-pdf",
    siteName: "PDFBerri",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function Page() {
  return <MergePdfPage />;
}