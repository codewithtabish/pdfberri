import type { Metadata } from "next";
import { PdfToPowerpointPage } from "@/components/pages/tools/pdf-to-powerpoint/pdf-to-powerpoint-page";

export const metadata: Metadata = {
  title: "PDF to PowerPoint Converter: High-Fidelity or Editable Slides | PDFBerri",
  description:
    "Convert PDF pages to a real PPTX file in your browser. Choose High-Fidelity image slides or Editable slides that rebuild text and images where possible.",
  alternates: { canonical: "/tools/pdf-to-powerpoint" },
  openGraph: {
    title: "PDF to PowerPoint | PDFBerri",
    description: "Convert PDF pages to PowerPoint slides directly in your browser.",
    url: "/tools/pdf-to-powerpoint",
    type: "website",
  },
};

export default function Page() {
  return <PdfToPowerpointPage />;
}