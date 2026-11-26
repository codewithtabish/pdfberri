import PopularTools from "@/components/pages/home/popular-tools";
import { ExtractImages } from "@/components/pages/tools/extract-images";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Extract Images from PDF — Free & Private | PDFBerri",
  description:
    "Extract embedded images from your PDF documents instantly. Download in original quality, locally in your browser.",
};

export default function ExtractImagesPage() {
  return (
    <>
      <ExtractImages />
      <PopularTools/>
    </>
  );
}