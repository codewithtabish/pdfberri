import { ContactPage } from "@/components/pages/contact/contact-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | PDFBerri",
  description: "Get in touch with the PDFBerri team for support, feedback, or business inquiries.",
};

export default function Page() {
  return <ContactPage />;
}