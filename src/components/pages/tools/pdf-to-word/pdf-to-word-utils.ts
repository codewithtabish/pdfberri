// src/components/pages/tools/pdf-to-word/pdf-to-word-utils.ts

import {
  ConversionError,
  type ConversionErrorInfo,
} from "./pdf-to-word-types";

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );
  const value = bytes / 1024 ** i;
  return `${value >= 100 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
}

export function pluralize(count: number, singular: string, plural?: string) {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

/** Safe base name without extension. Prevents unsafe paths and odd characters. */
export function sanitizeBaseName(fileName: string): string {
  const base = fileName.split(/[\\/]/).pop() ?? "";
  const cleaned = base
    .replace(/\.pdf$/i, "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f<>:"/\\|?*]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 120)
    .trim();
  return cleaned || "document";
}

export function toDocxFileName(fileName: string): string {
  return `${sanitizeBaseName(fileName)}.docx`;
}

export function yieldToMain(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new ConversionError("cancelled", "Conversion cancelled.");
  }
}

const LIGATURES: Record<string, string> = {
  "\uFB00": "ff",
  "\uFB01": "fi",
  "\uFB02": "fl",
  "\uFB03": "ffi",
  "\uFB04": "ffl",
  "\uFB05": "st",
  "\uFB06": "st",
};

/** Removes characters that are illegal in XML and expands common ligatures. */
export function cleanText(input: string): string {
  return input
    .replace(/[\uFB00-\uFB06]/g, (c) => LIGATURES[c] ?? c)
    .replace(/[\u00A0\t\r\n]+/g, " ")
    .replace(
      // eslint-disable-next-line no-control-regex
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uFFFE\uFFFF]/g,
      "",
    );
}

const RTL_RE = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/g;
const LATIN_RE = /[A-Za-z\u00C0-\u024F\u0400-\u04FF]/g;

export function isRtlText(text: string): boolean {
  const rtl = (text.match(RTL_RE) ?? []).length;
  if (rtl === 0) return false;
  const latin = (text.match(LATIN_RE) ?? []).length;
  return rtl >= latin;
}

export function toErrorInfo(error: unknown): ConversionErrorInfo {
  if (error instanceof ConversionError) {
    return { code: error.code, message: error.message };
  }
  if (error instanceof DOMException && error.name === "AbortError") {
    return { code: "cancelled", message: "Conversion cancelled." };
  }
  return {
    code: "unknown",
    message:
      "Something went wrong while converting this PDF. Please try again, or try the other conversion mode.",
  };
}