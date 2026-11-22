// src/components/pages/tools/pdf-to-word/pdf-to-word-validation.ts

import { PDF_TO_WORD_LIMITS } from "./pdf-to-word-constants";
import { ConversionError } from "./pdf-to-word-types";
import { formatBytes } from "./pdf-to-word-utils";

/**
 * Validates size and the real PDF signature. The extension and browser MIME
 * type are never trusted on their own.
 */
export async function validatePdfFile(file: File): Promise<void> {
  if (file.size === 0) {
    throw new ConversionError("empty-file", "This file is empty.");
  }

  if (file.size > PDF_TO_WORD_LIMITS.maxFileSizeBytes) {
    throw new ConversionError(
      "file-too-large",
      `This file is ${formatBytes(file.size)}. The maximum supported size is ${formatBytes(PDF_TO_WORD_LIMITS.maxFileSizeBytes)}.`,
    );
  }

  const head = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  const text = new TextDecoder("latin1").decode(head);

  if (!text.includes("%PDF-")) {
    throw new ConversionError(
      "not-a-pdf",
      "This doesn't look like a valid PDF file. Please select a PDF document.",
    );
  }
}