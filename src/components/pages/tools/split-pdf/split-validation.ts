import { SPLIT_CONFIG } from "./split-config";
import { SplitError, formatBytes } from "./split-utils";

const ALLOWED_TYPES = new Set(["application/pdf", "application/x-pdf", ""]);

/**
 * Cheap, local checks before any heavy parsing. Never trusts MIME type or
 * extension alone: the file must start with a %PDF- header.
 * PDF.js (preview) and pdf-lib (worker) perform the deeper structural checks.
 */
export async function validatePdfFile(file: File): Promise<void> {
  const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");
  if (!hasPdfExtension || !ALLOWED_TYPES.has(file.type)) {
    throw new SplitError("invalid-type", "This file isn't a PDF. Please choose a file ending in .pdf.");
  }
  if (file.size === 0) {
    throw new SplitError("empty-file", "This file is empty. Please choose a different PDF.");
  }
  if (file.size > SPLIT_CONFIG.maxFileSizeBytes) {
    throw new SplitError(
      "too-large",
      `This PDF is ${formatBytes(file.size)}. The limit for this tool is ${formatBytes(SPLIT_CONFIG.maxFileSizeBytes)}.`,
    );
  }
  const head = await file.slice(0, 1024).text();
  if (!head.includes("%PDF-")) {
    throw new SplitError("invalid-pdf", "This file doesn't look like a valid PDF. It may be damaged or renamed.");
  }
}
