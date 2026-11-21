import {
  DEFAULT_OUTPUT_NAME,
  MAX_OUTPUT_NAME_LENGTH,
  MERGE_LIMITS,
} from "./merge-constants";
import type { MergeErrorCode } from "./merge-types";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

export function formatPages(count: number): string {
  return `${count} ${count === 1 ? "page" : "pages"}`;
}

export function formatFiles(count: number): string {
  return `${count} ${count === 1 ? "file" : "files"}`;
}

const ILLEGAL_NAME_CHARS = '<>:"/\\|?*';

/** Makes a safe download file name that always ends in .pdf. */
export function sanitizeOutputName(raw: string): string {
  const cleaned = Array.from(raw)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 32 && !ILLEGAL_NAME_CHARS.includes(char);
    })
    .join("")
    .trim();

  const base = cleaned
    .replace(/\.pdf$/i, "")
    .replace(/[. ]+$/, "")
    .slice(0, MAX_OUTPUT_NAME_LENGTH - 4);

  const fallback = DEFAULT_OUTPUT_NAME.replace(/\.pdf$/i, "");
  return `${base || fallback}.pdf`;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * Unique, easy-to-find download name, e.g.
 * PDFBerri-Merged-20261121-214200-k3x9.pdf
 * (date + time + 4 random characters, so no two downloads share a name).
 */
export function generateOutputName(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const random =
    crypto
      .getRandomValues(new Uint32Array(1))[0]
      ?.toString(36)
      .padStart(4, "0")
      .slice(-4) ?? "0000";

  return `PDFBerri-Merged-${date}-${time}-${random}.pdf`;
}

export function describeMergeError(
  code: MergeErrorCode,
  fileName?: string,
): string {
  const prefix = fileName ? `${fileName}: ` : "";

  switch (code) {
    case "not-pdf":
      return "This file isn't a valid PDF document.";
    case "empty":
      return "This file is empty.";
    case "too-large":
      return `This file is larger than ${formatBytes(MERGE_LIMITS.maxFileSizeBytes)}, the most this browser-based tool can safely process.`;
    case "too-many-files":
      return `You can merge up to ${MERGE_LIMITS.maxFiles} files at once.`;
    case "total-too-large":
      return `Adding this file would go over the combined size limit of ${formatBytes(MERGE_LIMITS.maxTotalSizeBytes)}.`;
    case "encrypted":
      return `${prefix}This PDF is password-protected or encrypted, so it can't be merged. If you're authorized to, remove the protection first, then add it again.`;
    case "corrupted":
      return `${prefix}This PDF looks damaged or uses a structure that can't be read.`;
    case "memory":
      return "Your browser ran out of memory while processing these files. Try fewer or smaller files.";
    case "worker":
      return "The PDF processor couldn't start in this browser. Refresh the page or try an up-to-date browser.";
    case "cancelled":
      return "Merging was cancelled.";
    case "failed":
    default:
      return "Something went wrong while merging. Your files are still here, so you can try again.";
  }
}