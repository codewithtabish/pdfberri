import type { Metadata } from "next";
import CareersPage from "@/components/pages/careers/careers-page";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join PDFBerri and help us build simple, friendly PDF and AI tools for everyone.",
};

export default function Page() {
  return <CareersPage />;
}