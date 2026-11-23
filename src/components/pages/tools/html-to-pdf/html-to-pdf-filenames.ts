/**
 * PDFBerri HTML → PDF — Safe Filename Generation
 */

export function sanitizeFilename(name: string): string {
  // Remove path components and dangerous characters
  const base = name
    .replace(/^.*[\\/]/, "") // strip path
    .replace(/[^\w\s\-_.()]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 120);

  return base || "document";
}

export function generatePdfFilename(originalName?: string, jobId?: string): string {
  const base = originalName
    ? sanitizeFilename(originalName.replace(/\.(html?|htm)$/i, ""))
    : "document";
  const suffix = jobId ? `-${jobId.slice(0, 8)}` : "";
  return `${base}${suffix}.pdf`;
}

export function generateJobId(): string {
  // cryptographically strong enough for temporary jobs
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // fallback
  return `h2p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
