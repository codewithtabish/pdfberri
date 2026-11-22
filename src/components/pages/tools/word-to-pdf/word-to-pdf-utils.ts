// src/components/pages/tools/word-to-pdf/word-to-pdf-utils.ts

import {
  DEFAULT_SETTINGS,
  MAX_CANVAS_PIXELS,
  PAGE_SIZES_PT,
} from "./word-to-pdf-constants";
import { WordToPdfError } from "./word-to-pdf-errors";
import type {
  PageSizeOption,
  QualityOption,
  WordToPdfSettings,
} from "./word-to-pdf-types";

export const CSS_PX_TO_PT = 0.75;

export function joinClasses(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const units = ["KB", "MB", "GB"] as const;
  let value = bytes / 1024;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  const rounded = value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[index]}`;
}

export function getExtension(fileName: string): string {
  const leaf = fileName.split(/[\\/]/).pop() ?? "";
  const dot = leaf.lastIndexOf(".");
  if (dot <= 0 || dot === leaf.length - 1) return "";
  return leaf.slice(dot + 1).toLowerCase();
}

const RESERVED_WINDOWS_NAMES = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

/** Strips path, extension, control and path-hostile characters. Never empty. */
export function toSafeBaseName(fileName: string): string {
  const leaf = fileName.split(/[\\/]/).pop() ?? "";
  const dot = leaf.lastIndexOf(".");
  const stem = dot > 0 ? leaf.slice(0, dot) : leaf;

  // eslint-disable-next-line no-control-regex
  const hostile = /[\u0000-\u001f\u007f<>:"/\\|?*]/g;
  let safe = stem
    .normalize("NFKC")
    .replace(hostile, "-")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[.\s]+|[.\s]+$/g, "");

  safe = Array.from(safe).slice(0, 100).join("").trim();
  if (safe.length === 0) return "document";
  if (RESERVED_WINDOWS_NAMES.test(safe)) return `_${safe}`;
  return safe;
}

export function buildPdfFileName(originalName: string): string {
  return `${toSafeBaseName(originalName)}.pdf`;
}

export function isPageSize(value: unknown): value is PageSizeOption {
  return value === "original" || value === "a4" || value === "letter";
}

export function isQuality(value: unknown): value is QualityOption {
  return value === "standard" || value === "high" || value === "maximum";
}

/** Coerces unknown input into valid settings, falling back to defaults. */
export function normalizeSettings(
  input: Partial<Record<keyof WordToPdfSettings, unknown>> | null | undefined,
): WordToPdfSettings {
  return {
    pageSize: isPageSize(input?.pageSize)
      ? input.pageSize
      : DEFAULT_SETTINGS.pageSize,
    quality: isQuality(input?.quality) ? input.quality : DEFAULT_SETTINGS.quality,
  };
}

export function resolveTargetPageSize(
  option: PageSizeOption,
  contentWidthPt: number,
  contentHeightPt: number,
): [number, number] {
  if (option === "original") return [contentWidthPt, contentHeightPt];
  const [width, height] = PAGE_SIZES_PT[option];
  return contentWidthPt > contentHeightPt ? [height, width] : [width, height];
}

export interface Placement {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Scales content to fit inside a box, centred (PDF coordinates, origin bottom-left). */
export function fitContain(
  contentWidth: number,
  contentHeight: number,
  boxWidth: number,
  boxHeight: number,
): Placement {
  const scale = Math.min(boxWidth / contentWidth, boxHeight / contentHeight);
  const width = contentWidth * scale;
  const height = contentHeight * scale;
  return { x: (boxWidth - width) / 2, y: (boxHeight - height) / 2, width, height };
}

/** Lowers the render scale so a page canvas never exceeds browser limits. */
export function effectiveScale(
  requestedScale: number,
  widthPx: number,
  heightPx: number,
  maxPixels: number = MAX_CANVAS_PIXELS,
): number {
  const area = widthPx * heightPx;
  if (!(area > 0)) return 1;
  const cap = Math.sqrt(maxPixels / area);
  return Math.max(0.5, Math.min(requestedScale, cap));
}

export function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) throw new WordToPdfError("CANCELLED");
}

export function yieldToMain(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
