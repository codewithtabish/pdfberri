import type { Metadata } from "next";
import { SignPdfWorkspace, SignPdfFaq, SignPdfPopularTools } from "@/components/pages/tools/sign-pdf";

export const metadata: Metadata = {
  title: "Sign PDF Online | PDFBerri",
  description: "Add your signature to a PDF document. Draw, type, or upload your signature and download your signed document.",
  alternates: { canonical: "/tools/sign-pdf" },
};

export default function SignPdfPage() {
  return (
    <main>
      <SignPdfWorkspace />
      <SignPdfPopularTools />
      <SignPdfFaq />
    </main>
  );
}