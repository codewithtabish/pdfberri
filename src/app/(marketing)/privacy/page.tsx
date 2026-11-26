import { PrivacyPage } from "@/components/pages/privacy/privacy-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | PDFBerri",
  description: "Learn how PDFBerri handles your documents, protects your data, and ensures a secure workspace for all your PDF tasks.",
};

export default function Page() {
  return <PrivacyPage />;
}