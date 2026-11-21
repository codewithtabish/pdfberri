import type { CompressErrorCode } from "./compress-types";

export class CompressError extends Error {
  readonly code: CompressErrorCode;
  constructor(code: CompressErrorCode, message: string) {
    super(message);
    this.name = "CompressError";
    this.code = code;
  }
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof CompressError) return error.message;
  return "Something went wrong while compressing your PDF. Please try again.";
}

let idCounter = 0;
export function createId(prefix = "id"): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
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

export function formatPercent(value: number): string {
  return `${value.toFixed(value >= 10 || value === 0 ? 0 : 1)}%`;
}

export interface Comparison {
  bytesSaved: number;
  reductionPercentage: number;
  isReduced: boolean;
  isLarger: boolean;
  isSame: boolean;
}

export function compareSizes(originalSize: number, compressedSize: number): Comparison {
  const bytesSaved = originalSize - compressedSize;
  const reductionPercentage = originalSize > 0 ? (bytesSaved / originalSize) * 100 : 0;
  const same = Math.abs(reductionPercentage) < 1;
  return {
    bytesSaved,
    reductionPercentage,
    isReduced: !same && bytesSaved > 0,
    isLarger: !same && bytesSaved < 0,
    isSame: same,
  };
}

export function sanitizeFilename(raw: string): string {
  const cleaned = raw.replace(/[<>:"/\\|?*\x00-\x1f]/g, "").trim();
  const base = cleaned.replace(/\.pdf$/i, "").replace(/[. ]+$/, "");
  return `${base || "compressed"}.pdf`;
}