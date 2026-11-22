// src/app/tools/pdf-to-word/page.tsx

import type { Metadata } from "next";
import { PDF_TO_WORD_ROUTE } from "@/components/pages/tools/pdf-to-word/pdf-to-word-constants";
import { PdfToWordPage } from "@/components/pages/tools/pdf-to-word/pdf-to-word-page";

const TITLE = "PDF to Word Converter — Convert PDF to Editable DOCX | PDFBerri";
const DESCRIPTION =
  "Convert PDF files into editable Word documents with PDFBerri. Choose layout-focused or editable-text conversion and use OCR for supported scanned PDFs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PDF_TO_WORD_ROUTE },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PDF_TO_WORD_ROUTE,
    siteName: "PDFBerri",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function Page() {
  return <PdfToWordPage />;
}