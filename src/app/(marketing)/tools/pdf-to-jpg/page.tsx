import type { Metadata } from "next";
import { PdfToJpgPage } from "@/components/pages/tools/pdf-to-jpg/pdf-to-jpg-page";

export const metadata: Metadata = {
  title: "PDF to JPG Converter – Convert PDF Pages to JPG Online | PDFBerri",
  description: "Convert PDF pages into high-quality JPG images. Select pages, adjust resolution and quality, and download individual images or a ZIP file with PDFBerri.",
  alternates: { canonical: "/tools/pdf-to-jpg" },
};

export default function PdfToJpgRoute() {
  return <PdfToJpgPage />;
}