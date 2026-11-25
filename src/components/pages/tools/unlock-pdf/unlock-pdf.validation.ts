import type { UnlockErrorCode } from "./unlock-pdf.types";

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export interface ValidationResult {
  valid: boolean;
  error?: UnlockErrorCode;
}

export async function validatePDFFile(file: File): Promise<ValidationResult> {
  if (!file) return { valid: false, error: "empty-file" };
  if (file.size === 0) return { valid: false, error: "empty-file" };
  if (file.size > MAX_FILE_SIZE) return { valid: false, error: "file-too-large" };

  const isPdfMime = file.type === "application/pdf";
  const isPdfExt = file.name.toLowerCase().endsWith(".pdf");
  if (!isPdfMime && !isPdfExt) return { valid: false, error: "invalid-type" };

  try {
    const headerBuffer = await file.slice(0, 5).arrayBuffer();
    const header = new TextDecoder("ascii").decode(headerBuffer);
    if (!header.startsWith("%PDF-")) return { valid: false, error: "corrupted" };
  } catch {
    return { valid: false, error: "file-unreadable" };
  }

  return { valid: true };
}