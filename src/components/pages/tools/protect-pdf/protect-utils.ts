import { ProtectPdfEngineError, type ProtectPdfErrorCode } from "./protect-types";

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  const mb = bytes / (1024 * 1024);
  return `${mb >= 100 ? Math.round(mb) : mb.toFixed(1)} MB`;
}

export function formatPageCount(count: number): string {
  return `${count} ${count === 1 ? "page" : "pages"}`;
}

export function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

/** Looks for "%PDF-" in the first 1 KB, as the PDF spec allows. */
export function hasPdfSignature(bytes: Uint8Array, searchLimit = 1024): boolean {
  const end = Math.min(bytes.length, searchLimit + 5);
  for (let i = 0; i + 4 < end; i += 1) {
    if (
      bytes[i] === 0x25 &&
      bytes[i + 1] === 0x50 &&
      bytes[i + 2] === 0x44 &&
      bytes[i + 3] === 0x46 &&
      bytes[i + 4] === 0x2d
    ) {
      return true;
    }
  }
  return false;
}

/** "My File.pdf" -> "My File-protected.pdf". Never contains the password. */
export function buildProtectedFileName(originalName: string): string {
  const base = originalName
    .replace(/\.pdf$/i, "")
    .replace(/[\\/:*?"<>|]/g, "-")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .replace(/^\.+/, "")
    .trim()
    .slice(0, 120);
  return `${base || "document"}-protected.pdf`;
}

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function triggerDownload(url: string, fileName: string): void {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function wipeBuffer(buffer: ArrayBuffer): void {
  try {
    new Uint8Array(buffer).fill(0);
  } catch {
    /* buffer may already be detached */
  }
}

export function toErrorCode(error: unknown): ProtectPdfErrorCode {
  if (error instanceof ProtectPdfEngineError) return error.code;
  if (error instanceof RangeError) return "out-of-memory";
  if (typeof DOMException !== "undefined" && error instanceof DOMException) {
    if (error.name === "NotReadableError" || error.name === "NotFoundError") return "file-unreadable";
  }
  return "unknown";
}