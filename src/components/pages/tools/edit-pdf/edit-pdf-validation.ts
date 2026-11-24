// src/components/pages/tools/edit-pdf/edit-pdf-validation.ts

import { EDIT_PDF_CONFIG } from './edit-pdf-constants';
import type { ValidationResult } from './edit-pdf-types';

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-

/**
 * Validates a File before handing it to the PDF engine.
 */
export async function validatePdfFile(file: File): Promise<ValidationResult> {
  const allowed = EDIT_PDF_CONFIG.allowedMimeTypes as readonly string[];

  if (!allowed.includes(file.type)) {
    return {
      valid: false,
      error: 'Please select a PDF file.',
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'This file is empty.',
    };
  }

  if (file.size > EDIT_PDF_CONFIG.maxFileSizeBytes) {
    const limitMb = Math.round(EDIT_PDF_CONFIG.maxFileSizeBytes / (1024 * 1024));
    return {
      valid: false,
      error: `File exceeds the ${limitMb} MB limit.`,
    };
  }

  const headBuf = await file.slice(0, 5).arrayBuffer();
  const head = new Uint8Array(headBuf);
  const magicOk = PDF_MAGIC.every((b, i) => head[i] === b);

  if (!magicOk) {
    return {
      valid: false,
      error: 'This file is not a valid PDF.',
    };
  }

  return { valid: true };
}

/**
 * Alias for validatePdfFile.
 * This fixes the `validateFile` import error in use-edit-pdf.ts
 */
export const validateFile = validatePdfFile;

/**
 * Validates the parsed PDF Document.
 * Used by edit-pdf-engine.ts
 */
export function validateLoadedDocument(
  pageCount: number,
  isEncrypted: boolean
): ValidationResult {
  if (isEncrypted) {
    return { valid: false, isEncrypted: true, error: 'PDF is encrypted' };
  }
  if (pageCount === 0) {
    return { valid: false, error: 'PDF contains no pages' };
  }
  if (pageCount > EDIT_PDF_CONFIG.maxPageCount) {
    return {
      valid: false,
      error: `Document has ${pageCount} pages (limit ${EDIT_PDF_CONFIG.maxPageCount}).`,
    };
  }
  return { valid: true };
}