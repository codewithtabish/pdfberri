import { TermsPage } from "@/components/pages/terms/terms-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | PDFBerri",
  description: "Read the terms and conditions governing the use of PDFBerri's online PDF tools and AI-powered document services.",
};

export default function Page() {
  return <TermsPage />;
}