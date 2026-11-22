import { ROTATE_CONFIG } from "./rotate-config";
import { RotateError } from "./rotate-utils";

export async function validatePdfFile(file: File): Promise<void> {
  const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");
  if (!hasPdfExtension) {
    throw new RotateError("This file isn't a PDF. Please choose a file ending in .pdf.");
  }
  if (file.size === 0) {
    throw new RotateError("This file is empty. Please choose a different PDF.");
  }
  if (file.size > ROTATE_CONFIG.maxFileSizeBytes) {
    throw new RotateError(`This PDF is larger than the ${ROTATE_CONFIG.maxFileSizeBytes / (1024 * 1024)} MB limit.`);
  }
  const head = await file.slice(0, 1024).text();
  if (!head.includes("%PDF-")) {
    throw new RotateError("This file doesn't look like a valid PDF. It may be damaged or renamed.");
  }
}