// src/components/pages/tools/word-to-pdf/word-to-pdf-errors.ts

import type { WordToPdfErrorCode } from "./word-to-pdf-types";

export class WordToPdfError extends Error {
  readonly code: WordToPdfErrorCode;
  /** Short, non-sensitive context such as "50 MB". Never document content. */
  readonly detail?: string;

  constructor(code: WordToPdfErrorCode, detail?: string) {
    super(code);
    this.name = "WordToPdfError";
    this.code = code;
    this.detail = detail;
  }
}

export interface UserFacingError {
  title: string;
  description: string;
  action: string;
}

export function describeError(
  code: WordToPdfErrorCode,
  detail?: string,
): UserFacingError {
  switch (code) {
    case "EMPTY_FILE":
      return {
        title: "This file is empty",
        description: "The selected file has no content.",
        action: "Choose a Word document that contains text, images, or tables.",
      };
    case "FILE_TOO_LARGE":
      return {
        title: "This file is too large",
        description: detail
          ? `Documents up to ${detail} can be converted here.`
          : "This document is larger than the supported size.",
        action:
          "Compress the images in Word (Picture Format → Compress Pictures) or choose a smaller document.",
      };
    case "UNSUPPORTED_TYPE":
      return {
        title: "This isn’t a Word document",
        description: "Only Word documents (.docx, and .doc where available) can be converted.",
        action: "Choose a .docx file. For other formats, use the matching PDFBerri tool.",
      };
    case "EXTENSION_MISMATCH":
      return {
        title: "The file type doesn’t match its name",
        description:
          "The file’s contents don’t match its extension, so it can’t be treated as a Word document safely.",
        action: "Open the file in Word and use Save As to create a fresh .docx file.",
      };
    case "CORRUPT_DOCUMENT":
      return {
        title: "We couldn’t read this document",
        description: "The file looks damaged or isn’t a valid Word document.",
        action: "Open it in Word, save a new copy as .docx, and try again.",
      };
    case "PASSWORD_PROTECTED_OR_LEGACY":
      return {
        title: "This file looks password-protected or uses an older format",
        description:
          "Password-protected Word files and older .doc files can’t be opened by the in-browser converter.",
        action:
          "In Word, remove the password (only if you’re allowed to) and save as .docx, then try again.",
      };
    case "UNSAFE_ARCHIVE":
      return {
        title: "This document can’t be processed safely",
        description:
          "Its internal structure is unusually large, malformed, or contains content PDFBerri doesn’t process.",
        action: "Save a clean copy as .docx from Word and try again.",
      };
    case "MULTIPLE_FILES":
      return {
        title: "Please choose one document",
        description: "Word to PDF converts one document at a time.",
        action: "Select a single .docx file.",
      };
    case "FILE_UNREADABLE":
      return {
        title: "We couldn’t open the selected file",
        description: "The browser wasn’t able to read it. It may have been moved or is in use.",
        action: "Close it in other apps, then select it again.",
      };
    case "TOO_MANY_PAGES":
      return {
        title: "This document has too many pages for in-browser conversion",
        description: detail
          ? `In-browser conversion supports up to ${detail} pages.`
          : "The document is longer than the supported page count.",
        action: "Split the document into smaller parts in Word and convert each part.",
      };
    case "ENGINE_UNAVAILABLE":
      return {
        title: "This conversion isn’t available right now",
        description:
          "Older .doc files need server conversion, which isn’t enabled at the moment.",
        action: "Open the file in Word, save it as .docx, and try again.",
      };
    case "CONSENT_REQUIRED":
      return {
        title: "Your permission is needed",
        description: "This document can only be converted on a server, and nothing is uploaded without your consent.",
        action: "Tick the permission box and convert again.",
      };
    case "RENDER_FAILED":
      return {
        title: "We couldn’t convert this document in your browser",
        description:
          "The document uses features the in-browser converter can’t render.",
        action: "Try again, or convert it on the server if that option is shown.",
      };
    case "OUT_OF_MEMORY":
      return {
        title: "Your browser ran out of memory",
        description: "This document is too heavy to convert on this device.",
        action:
          "Close other tabs and try again, use Standard quality, or convert on the server if offered.",
      };
    case "INVALID_OUTPUT":
      return {
        title: "The conversion didn’t produce a valid PDF",
        description: "We checked the result and it isn’t a usable PDF, so it wasn’t offered for download.",
        action: "Try again. If it keeps happening, save a fresh copy as .docx first.",
      };
    case "NETWORK":
      return {
        title: "The connection was interrupted",
        description: "We couldn’t reach the conversion server.",
        action: "Check your connection and try again.",
      };
    case "SERVER_BUSY":
      return {
        title: "The server is busy",
        description: "Too many documents are being converted right now.",
        action: "Wait a moment and try again.",
      };
    case "TIMEOUT":
      return {
        title: "The conversion took too long",
        description: "The document couldn’t be converted within the time limit.",
        action: "Try a smaller or simpler document.",
      };
    case "RATE_LIMITED":
      return {
        title: "Too many requests",
        description: "You’ve sent several conversions in a short time.",
        action: "Wait a minute and try again.",
      };
    case "FORBIDDEN":
      return {
        title: "This request wasn’t allowed",
        description: "The server rejected the request.",
        action: "Reload the page and try again.",
      };
    case "CANCELLED":
      return {
        title: "Conversion cancelled",
        description: "No PDF was created.",
        action: "Your document is still selected if you want to convert it again.",
      };
    case "UNKNOWN":
    default:
      return {
        title: "Something went wrong",
        description: "The conversion couldn’t be completed.",
        action: "Try again. If it keeps happening, save a fresh copy as .docx and retry.",
      };
  }
}

const KNOWN_CODES: ReadonlySet<string> = new Set<WordToPdfErrorCode>([
  "EMPTY_FILE",
  "FILE_TOO_LARGE",
  "UNSUPPORTED_TYPE",
  "EXTENSION_MISMATCH",
  "CORRUPT_DOCUMENT",
  "PASSWORD_PROTECTED_OR_LEGACY",
  "UNSAFE_ARCHIVE",
  "MULTIPLE_FILES",
  "FILE_UNREADABLE",
  "TOO_MANY_PAGES",
  "ENGINE_UNAVAILABLE",
  "CONSENT_REQUIRED",
  "RENDER_FAILED",
  "OUT_OF_MEMORY",
  "INVALID_OUTPUT",
  "NETWORK",
  "SERVER_BUSY",
  "TIMEOUT",
  "RATE_LIMITED",
  "FORBIDDEN",
  "CANCELLED",
  "UNKNOWN",
]);

export function isKnownErrorCode(value: unknown): value is WordToPdfErrorCode {
  return typeof value === "string" && KNOWN_CODES.has(value);
}

/** Codes after which offering server conversion (with consent) makes sense. */
export const SERVER_FALLBACK_CODES: ReadonlySet<WordToPdfErrorCode> = new Set<
  WordToPdfErrorCode
>(["RENDER_FAILED", "OUT_OF_MEMORY", "TOO_MANY_PAGES"]);

export function toWordToPdfError(error: unknown): WordToPdfError {
  if (error instanceof WordToPdfError) return error;

  const name =
    typeof error === "object" && error !== null && "name" in error
      ? String((error as { name: unknown }).name)
      : "";
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : "";

  if (name === "AbortError") return new WordToPdfError("CANCELLED");
  if (name === "NotReadableError" || name === "NotFoundError") {
    return new WordToPdfError("FILE_UNREADABLE");
  }
  if (
    error instanceof RangeError ||
    /out of memory|allocation failed|array buffer allocation/i.test(message)
  ) {
    return new WordToPdfError("OUT_OF_MEMORY");
  }
  return new WordToPdfError("UNKNOWN");
}
