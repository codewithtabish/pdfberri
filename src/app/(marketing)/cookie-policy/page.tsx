import { CookiesPage } from "@/components/pages/cookies/cookies-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | PDFBerri",
  description: "Learn how PDFBerri uses cookies and similar technologies to improve your experience and provide our services.",
};

export default function Page() {
  return <CookiesPage />;
}