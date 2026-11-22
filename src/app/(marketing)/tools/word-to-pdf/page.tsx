// src/app/tools/word-to-pdf/page.tsx

import type { Metadata } from "next";
import {
  WORD_TO_PDF_DESCRIPTION,
  WORD_TO_PDF_ROUTE,
  WORD_TO_PDF_TITLE,
} from "@/components/pages/tools/word-to-pdf/word-to-pdf-constants";
import { WordToPdfPage } from "@/components/pages/tools/word-to-pdf/word-to-pdf-page";

export const metadata: Metadata = {
  title: WORD_TO_PDF_TITLE,
  description: WORD_TO_PDF_DESCRIPTION,
  alternates: { canonical: WORD_TO_PDF_ROUTE },
  openGraph: {
    title: WORD_TO_PDF_TITLE,
    description: WORD_TO_PDF_DESCRIPTION,
    url: WORD_TO_PDF_ROUTE,
    siteName: "PDFBerri",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: WORD_TO_PDF_TITLE,
    description: WORD_TO_PDF_DESCRIPTION,
  },
};

export default function Page() {
  return <WordToPdfPage />;
}
