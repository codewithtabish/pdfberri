import PopularTools from "@/components/pages/home/popular-tools";
import { ExtractText } from "@/components/pages/tools/extract-text";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Extract Text from PDF — Free & Private | PDFBerri",
  description:
    "Extract raw text from your PDF documents instantly. Our local tool preserves reading order, Unicode characters, and formatting.",
};

export default function ExtractTextPage() {
  return (
    <>
      <ExtractText />
      <PopularTools/>
    </>
  );
}