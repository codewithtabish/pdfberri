export function getSafeFileName(original: string, page: number, index: number, ext: string): string {
  const base = original.replace(/\.pdf$/i, "").replace(/[^a-z0-9]/gi, "_").toLowerCase();
  return `${base}_page-${page}_image-${index}.${ext}`;
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!bytes || bytes <= 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatPages(pages: number[]): string {
  if (pages.length <= 1) return `Page ${pages[0] ?? 1}`;
  return `Pages ${pages.join(", ")}`;
}