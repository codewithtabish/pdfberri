export type ConverterErrorCode =
  | "INVALID_FILE"
  | "TOO_LARGE"
  | "EMPTY"
  | "PASSWORD"
  | "CORRUPT"
  | "TOO_MANY_PAGES"
  | "NO_PAGES"
  | "RENDER_FAILED"
  | "MEMORY"
  | "BUILD_FAILED"
  | "INVALID_OUTPUT"
  | "CANCELLED";

const MESSAGES: Record<ConverterErrorCode, string> = {
  INVALID_FILE: "This doesn't look like a valid PDF file.",
  TOO_LARGE: "This file is too large. The limit is 100 MB.",
  EMPTY: "This PDF has no pages to convert.",
  PASSWORD:
    "This PDF is password protected. Remove the password first, then try again.",
  CORRUPT: "This PDF is damaged or uses an unsupported structure and can't be read.",
  TOO_MANY_PAGES: "This document has too many pages. Select fewer pages and try again.",
  NO_PAGES: "Select at least one page to convert.",
  RENDER_FAILED: "A page couldn't be rendered. Try a lower quality or fewer pages.",
  MEMORY:
    "This conversion needs more memory than your browser can safely use. Select fewer pages or choose a lower quality.",
  BUILD_FAILED: "The PowerPoint file couldn't be created. Please try again.",
  INVALID_OUTPUT: "The generated file failed validation, so it was not offered for download.",
  CANCELLED: "Conversion cancelled.",
};

export class ConverterError extends Error {
  readonly code: ConverterErrorCode;

  constructor(code: ConverterErrorCode, message?: string) {
    super(message ?? MESSAGES[code]);
    this.name = "ConverterError";
    this.code = code;
  }
}

export function toConverterError(error: unknown): ConverterError {
  if (error instanceof ConverterError) return error;
  const name =
    typeof error === "object" && error !== null && "name" in error
      ? String((error as { name: unknown }).name)
      : "";
  if (name === "PasswordException") return new ConverterError("PASSWORD");
  if (name === "InvalidPDFException" || name === "FormatError" || name === "MissingPDFException") {
    return new ConverterError("CORRUPT");
  }
  if (name === "AbortException" || name === "RenderingCancelledException") {
    return new ConverterError("CANCELLED");
  }
  return new ConverterError("RENDER_FAILED");
}
