import type { OcrLanguage } from "./ocr-types";

export const SUPPORTED_LANGUAGES: OcrLanguage[] = [
  { code: "eng", name: "English" },
  { code: "urd", name: "Urdu" },
  { code: "ara", name: "Arabic" },
  { code: "deu", name: "German" },
  { code: "spa", name: "Spanish" },
  { code: "fra", name: "French" },
  { code: "hin", name: "Hindi" },
  { code: "chi_sim", name: "Chinese Simplified" },
  { code: "chi_tra", name: "Chinese Traditional" },
  { code: "por", name: "Portuguese" },
  { code: "ita", name: "Italian" },
  { code: "rus", name: "Russian" },
  { code: "jpn", name: "Japanese" },
  { code: "kor", name: "Korean" },
  { code: "tur", name: "Turkish" },
];

export function getOcrFileName(original: string): string {
  const base = original.replace(/\.pdf$/i, "");
  return `${base}-ocr.pdf`;
}