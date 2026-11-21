import { COMPRESS_CONFIG } from "./compress-config";
import { CompressError, formatBytes } from "./compress-utils";

const ALLOWED_TYPES = new Set(["application/pdf", "application/x-pdf", ""]);

export async function validatePdfFile(file: File): Promise<void> {
  const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");
  if (!hasPdfExtension || !ALLOWED_TYPES.has(file.type)) {
    throw new CompressError("invalid-type", "This file isn't a PDF. Please choose a file ending in .pdf.");
  }
  if (file.size === 0) {
    throw new CompressError("empty-file", "This file is empty. Please choose a different PDF.");
  }
  if (file.size < COMPRESS_CONFIG.minFileSizeBytes) {
    throw new CompressError("invalid-pdf", "This file is too small to be a valid PDF.");
  }
  if (file.size > COMPRESS_CONFIG.maxFileSizeBytes) {
    throw new CompressError(
      "too-large",
      `This PDF is ${formatBytes(file.size)}. The limit for this tool is ${formatBytes(COMPRESS_CONFIG.maxFileSizeBytes)}.`,
    );
  }
  const head = await file.slice(0, 1024).text();
  if (!head.includes("%PDF-")) {
    throw new CompressError("invalid-pdf", "This file doesn't look like a valid PDF. It may be damaged or renamed.");
  }
}