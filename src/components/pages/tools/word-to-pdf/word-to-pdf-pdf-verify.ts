// src/components/pages/tools/word-to-pdf/word-to-pdf-pdf-verify.ts
//
// Isomorphic PDF output verification (browser and Node).

import { PDF_MIME } from "./word-to-pdf-constants";
import { WordToPdfError } from "./word-to-pdf-errors";

const HEADER = [0x25, 0x50, 0x44, 0x46, 0x2d]; // "%PDF-"

function hasPdfHeader(bytes: Uint8Array): boolean {
  const limit = Math.min(bytes.length - HEADER.length, 1024);
  for (let start = 0; start <= limit; start += 1) {
    if (HEADER.every((value, index) => bytes[start + index] === value)) return true;
  }
  return false;
}

export interface VerifiedPdf {
  pageCount: number;
}

/**
 * Throws INVALID_OUTPUT unless the bytes are a parseable, non-empty PDF.
 * When `expectedPages` is given the page count must match.
 */
export async function verifyPdfBytes(
  bytes: Uint8Array,
  expectedPages?: number,
): Promise<VerifiedPdf> {
  if (bytes.byteLength < 8) throw new WordToPdfError("INVALID_OUTPUT");
  if (!hasPdfHeader(bytes)) throw new WordToPdfError("INVALID_OUTPUT");

  try {
    const { PDFDocument } = await import("pdf-lib");
    const pdf = await PDFDocument.load(bytes, {
      updateMetadata: false,
      throwOnInvalidObject: true,
    });
    const pageCount = pdf.getPageCount();
    if (pageCount < 1) throw new WordToPdfError("INVALID_OUTPUT");
    if (expectedPages !== undefined && pageCount !== expectedPages) {
      throw new WordToPdfError("INVALID_OUTPUT");
    }
    return { pageCount };
  } catch (error) {
    if (error instanceof WordToPdfError) throw error;
    throw new WordToPdfError("INVALID_OUTPUT");
  }
}

export function pdfBytesToBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes as unknown as BlobPart], { type: PDF_MIME });
}
