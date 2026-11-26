import { OcrPdf } from "@/components/pages/tools/ocr-pdf";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OCR PDF — Make Scanned PDFs Searchable | PDFBerri",
  description:
    "Convert scanned PDFs into searchable, selectable documents using powerful local OCR technology. Your files stay on your device.",
};

export default function OcrPdfPage() {
  return (
    
      <OcrPdf />
  );
}