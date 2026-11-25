import type { UnlockErrorCode } from "./unlock-pdf.types";

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  const mb = bytes / (1024 * 1024);
  return `${mb >= 100 ? Math.round(mb) : mb.toFixed(1)} MB`;
}

export function formatPageCount(count: number): string {
  return `${count} ${count === 1 ? "page" : "pages"}`;
}

export function buildUnlockedFileName(originalName: string): string {
  const base = originalName
    .replace(/\.pdf$/i, "")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^\.+/, "")
    .trim()
    .slice(0, 120);
  return `${base || "document"}-unlocked.pdf`;
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

export function getErrorMessage(code: UnlockErrorCode | null): string {
  switch (code) {
    case "invalid-type": return "That isn't a PDF. Please select a valid PDF file.";
    case "empty-file": return "This file is empty. Please choose a different PDF.";
    case "file-too-large": return "This file is too large. Please try a smaller PDF.";
    case "file-unreadable": return "We couldn't read this file. It may have been moved or deleted.";
    case "corrupted": return "This PDF appears to be damaged. Please try another file.";
    case "already-unlocked": return "This PDF does not require an opening password.";
    case "incorrect-password": return "The password you entered is incorrect. Please try again.";
    case "unsupported-encryption": return "This PDF uses an encryption method that is not currently supported.";
    case "engine-init-failed": return "The processing engine couldn't start. Please reload the page and try again.";
    case "processing-failed": return "Something went wrong while unlocking your PDF. Please try again.";
    case "download-failed": return "Download failed. Your browser may have blocked it.";
    default: return "An unexpected error occurred. Please try again.";
  }
}