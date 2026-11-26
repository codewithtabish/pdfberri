import { FaqPage } from "@/components/pages/faq/faq-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | PDFBerri",
  description: "Find helpful answers about PDFBerri's tools, document processing, AI features, privacy, and everything you need to get started.",
};

export default function Page() {
  return <FaqPage />;
}