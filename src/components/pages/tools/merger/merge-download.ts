export interface PdfDownload {
  url: string;
  revoke: () => void;
}

/** Creates a local, in-browser download URL. Nothing is uploaded anywhere. */
export function createPdfDownload(buffer: ArrayBuffer): PdfDownload {
  const blob = new Blob([buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  return { url, revoke: () => URL.revokeObjectURL(url) };
}

/**
 * Starts a download from a click handler. The URL is NOT revoked here, so the
 * user can download again; it is revoked when the workspace resets or unmounts.
 */
export function triggerDownload(url: string, fileName: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => link.remove(), 0);
}