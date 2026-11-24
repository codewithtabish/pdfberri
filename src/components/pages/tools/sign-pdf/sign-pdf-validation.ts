// src/components/pages/tools/sign-pdf/sign-pdf-validation.ts
import { MAX_FILE_SIZE } from "./sign-pdf-constants";

export function validatePdf(file: File): string | null {
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return "Please upload a PDF file.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File is too large (max 50MB).";
  }
  if (file.size === 0) {
    return "File is empty.";
  }
  return null;
}