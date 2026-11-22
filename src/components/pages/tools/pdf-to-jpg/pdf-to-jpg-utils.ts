export class PdfToJpgError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfToJpgError";
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9\-_]/gi, "_").replace(/_+/g, "_");
}