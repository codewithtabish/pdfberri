import { PDF_TO_JPG_CONFIG } from "./pdf-to-jpg-config";
import { PdfToJpgError } from "./pdf-to-jpg-utils";

export async function validatePdfFile(file: File): Promise<void> {
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    throw new PdfToJpgError("Please select a valid PDF file.");
  }
  if (file.size === 0) {
    throw new PdfToJpgError("This file is empty.");
  }
  if (file.size > PDF_TO_JPG_CONFIG.maxFileSizeBytes) {
    throw new PdfToJpgError(`This PDF is larger than the ${PDF_TO_JPG_CONFIG.maxFileSizeBytes / (1024 * 1024)} MB limit.`);
  }
  const head = await file.slice(0, 1024).text();
  if (!head.includes("%PDF-")) {
    throw new PdfToJpgError("This file doesn't look like a valid PDF.");
  }
}