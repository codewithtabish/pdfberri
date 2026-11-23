import { HtmlToPdfWorkspace } from "@/components/pages/tools/html-to-pdf";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTML to PDF Converter – Convert HTML to PDF Online | PDFBerri",
  description:
    "Convert HTML files, pasted HTML code, and supported webpages into PDF documents with PDFBerri. Customize page settings and download your PDF.",
  openGraph: {
    title: "HTML to PDF Converter | PDFBerri",
    description:
      "Convert HTML files, code, and web content into professional PDF documents quickly and easily.",
  },
};

export default function HtmlToPdfPage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Heading — no extra page padding; Container owns horizontal spacing */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          HTML to PDF Converter
        </h1>
        <p className="mt-2 text-muted-foreground">
          Convert HTML files, code, and web content into professional PDF documents quickly and easily.
        </p>
      </header>

      <HtmlToPdfWorkspace />
    </div>
  );
}