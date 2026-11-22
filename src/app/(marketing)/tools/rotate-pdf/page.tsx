import type { Metadata } from "next";
import { RotatePdfPage } from "@/components/pages/tools/rotate-pdf/rotate-page";

export const metadata: Metadata = {
  title: "Rotate PDF Pages Online Free | PDFBerri",
  description: "Rotate individual PDF pages or an entire document online. Preview your changes and download your corrected PDF with PDFBerri's private, browser-based PDF tool.",
  alternates: { canonical: "/tools/rotate-pdf" },
};

export default function RotatePdfRoute() {
  return <RotatePdfPage />;
}