import { PowerPointToPdf } from "@/components/pages/tools/powerpoint-to-pdf";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PowerPoint to PDF — Convert PPT & PPTX | PDFBerri",
  description:
    "Convert PowerPoint presentations (PPT, PPTX) to professional PDF documents while preserving slide layouts, fonts, and images.",
};

export default function PowerPointToPdfPage() {
  return (
      <PowerPointToPdf />
  );
}