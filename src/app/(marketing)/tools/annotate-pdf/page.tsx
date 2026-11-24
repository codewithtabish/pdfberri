// app/tools/annotate-pdf/page.tsx
import type { Metadata } from "next";
import { AnnotatePdfFaq } from "@/components/pages/tools/annotate-pdf/annotate-pdf-faq";
import { AnnotatePdfPopularTools } from "@/components/pages/tools/annotate-pdf/annotate-pdf-popular-tools";
import { AnnotatePdfWorkspace } from "@/components/pages/tools/annotate-pdf/annotate-pdf-workspace";

export const metadata: Metadata = {
  title: "Annotate PDF Online | PDFBerri",
  description:
    "Highlight text, draw, underline, add comments, and annotate PDF documents online with PDFBerri.",
  alternates: { canonical: "/tools/annotate-pdf" },
  openGraph: {
    title: "Annotate PDF Online | PDFBerri",
    description:
      "Highlight text, draw, underline, add comments, and annotate PDF documents online with PDFBerri.",
    type: "website",
    url: "/tools/annotate-pdf",
  },
};

export default function AnnotatePdfPage() {
  return (
    <main>
      <AnnotatePdfWorkspace />
      <AnnotatePdfPopularTools />
      <AnnotatePdfFaq />
    </main>
  );
}