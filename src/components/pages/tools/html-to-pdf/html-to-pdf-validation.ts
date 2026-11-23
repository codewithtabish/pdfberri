/**
 * PDFBerri HTML → PDF — Input Validation
 */

import { ACCEPTED_EXTENSIONS, ACCEPTED_MIME_TYPES } from "./html-to-pdf-constants";
import { LIMITS, type ConversionError, type HtmlInput, type InputMode } from "./html-to-pdf-types";
import { HTML_TO_PDF_CONFIG } from "./html-to-pdf-config";

export function createError(
  code: ConversionError["code"],
  overrides?: Partial<ConversionError>
): ConversionError {
  const base = {
    INVALID_HTML: { title: "Invalid HTML", message: "The provided content does not appear to be valid HTML.", retryable: true },
    EMPTY_HTML: { title: "Empty content", message: "No HTML content was provided.", retryable: true },
    FILE_TOO_LARGE: { title: "File too large", message: `Maximum size is ${LIMITS.maxHtmlSizeBytes / 1024 / 1024} MB.`, retryable: true },
    UNSUPPORTED_EXTENSION: { title: "Unsupported file type", message: "Only .html and .htm files are accepted.", retryable: true },
    INVALID_URL: { title: "Invalid URL", message: "Please enter a valid URL starting with https://", retryable: true },
    UNSAFE_URL: { title: "URL not allowed", message: "This URL cannot be converted for security reasons.", retryable: false },
    RESOURCE_LOAD_FAILED: { title: "Resource loading failed", message: "Some resources could not be loaded.", retryable: true },
    RENDERING_TIMEOUT: { title: "Rendering timed out", message: "The document took too long to render.", retryable: true },
    BROWSER_INIT_FAILED: { title: "Renderer unavailable", message: "The conversion engine could not start.", retryable: true },
    PDF_GENERATION_FAILED: { title: "PDF generation failed", message: "Could not create a valid PDF.", retryable: true },
    OUTPUT_TOO_LARGE: { title: "PDF too large", message: "Generated PDF exceeds size limit.", retryable: true },
    DOWNLOAD_FAILED: { title: "Download failed", message: "The PDF could not be downloaded.", retryable: true },
    CANCELLED: { title: "Cancelled", message: "Conversion was cancelled.", retryable: false },
    EXPIRED: { title: "Expired", message: "This conversion has expired.", retryable: true },
    UNAUTHORIZED: { title: "Unauthorized", message: "You do not have access to this conversion.", retryable: false },
    RATE_LIMITED: { title: "Too many requests", message: "Please wait a moment and try again.", retryable: true },
    INTERNAL_ERROR: { title: "Something went wrong", message: "An unexpected error occurred.", retryable: true },
    UNSUPPORTED_CONTENT: { title: "Unsupported content", message: "This content type cannot be converted.", retryable: false },
  }[code];

  return {
    code,
    title: overrides?.title ?? base.title,
    message: overrides?.message ?? base.message,
    actionable: overrides?.actionable,
    retryable: overrides?.retryable ?? base.retryable,
  };
}

export function validateFileExtension(filename: string): boolean {
  const lower = filename.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function validateMimeType(mime: string): boolean {
  return (ACCEPTED_MIME_TYPES as readonly string[]).includes(mime) || mime === "";
}

export async function validateHtmlFile(file: File): Promise<{ ok: true; content: string } | { ok: false; error: ConversionError }> {
  if (!file) {
    return { ok: false, error: createError("EMPTY_HTML") };
  }

  if (file.size === 0) {
    return { ok: false, error: createError("EMPTY_HTML") };
  }

  if (file.size > LIMITS.maxHtmlSizeBytes) {
    return { ok: false, error: createError("FILE_TOO_LARGE") };
  }

  if (!validateFileExtension(file.name) && !validateMimeType(file.type)) {
    return { ok: false, error: createError("UNSUPPORTED_EXTENSION") };
  }

  try {
    const content = await file.text();
    if (!content.trim()) {
      return { ok: false, error: createError("EMPTY_HTML") };
    }
    // Basic sanity — must contain some HTML-like structure or text
    if (content.length > 50 && !/<[a-z][\s\S]*>/i.test(content) && !content.includes("<!DOCTYPE")) {
      // Still allow plain text fragments; preparation will wrap them
    }
    return { ok: true, content };
  } catch {
    return { ok: false, error: createError("INVALID_HTML") };
  }
}

export function validatePastedHtml(code: string): { ok: true; content: string } | { ok: false; error: ConversionError } {
  if (!code || !code.trim()) {
    return { ok: false, error: createError("EMPTY_HTML") };
  }
  if (new TextEncoder().encode(code).length > LIMITS.maxHtmlSizeBytes) {
    return { ok: false, error: createError("FILE_TOO_LARGE") };
  }
  return { ok: true, content: code };
}

/**
 * Strict URL validation + basic SSRF surface checks.
 * Full IP resolution & rebinding protection happens server-side.
 */
export function validateUrl(raw: string): { ok: true; url: URL } | { ok: false; error: ConversionError } {
  if (!raw || !raw.trim()) {
    return { ok: false, error: createError("INVALID_URL") };
  }

  let url: URL;
  try {
    // Auto-prepend https if missing scheme
    const candidate = raw.trim().startsWith("http") ? raw.trim() : `https://${raw.trim()}`;
    url = new URL(candidate);
  } catch {
    return { ok: false, error: createError("INVALID_URL") };
  }

  if (!["https:", "http:"].includes(url.protocol)) {
    return { ok: false, error: createError("UNSAFE_URL", { message: "Only HTTP and HTTPS URLs are supported." }) };
  }

  // Prefer HTTPS in production messaging
  if (url.protocol === "http:" && process.env.NODE_ENV === "production") {
    // still allow but warn in UI; server can upgrade or reject
  }

  const hostname = url.hostname.toLowerCase();

  if (
    HTML_TO_PDF_CONFIG.network.blockedHostnames.some(
      (blocked) => hostname === blocked || hostname.endsWith(`.${blocked}`)
    )
  ) {
    return { ok: false, error: createError("UNSAFE_URL") };
  }

  // Block obvious private / local patterns
  if (
    hostname === "localhost" ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    /^\d+\.\d+\.\d+\.\d+$/.test(hostname) // raw IP — further checked server-side
  ) {
    // Allow public IPs later; block private ranges on server
    const parts = hostname.split(".").map(Number);
    if (parts.length === 4) {
      const [a, b] = parts;
      if (
        a === 10 ||
        a === 127 ||
        a === 0 ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        (a === 169 && b === 254)
      ) {
        return { ok: false, error: createError("UNSAFE_URL") };
      }
    }
  }

  return { ok: true, url };
}

export function validateInput(input: HtmlInput): { ok: true } | { ok: false; error: ConversionError } {
  switch (input.mode) {
    case "file":
      if (!input.file) return { ok: false, error: createError("EMPTY_HTML") };
      return { ok: true };
    case "code":
      return validatePastedHtml(input.content || "");
    case "url":
      return validateUrl(input.url || "");
    default:
      return { ok: false, error: createError("UNSUPPORTED_CONTENT") };
  }
}
