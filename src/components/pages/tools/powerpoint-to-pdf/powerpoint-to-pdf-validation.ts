import { ACCEPTED_EXTENSIONS, MAX_FILE_BYTES } from "./powerpoint-to-pdf-constants";
import type { PptErrorCode, PptFinalizeRequest, PptSettings } from "./powerpoint-to-pdf-types";

export type FileValidation = { ok: true } | { ok: false; code: PptErrorCode };
export type RangeResult = { ok: true; slides: number[] } | { ok: false; error: string };
export type SettingsValidation =
  | { ok: true; request: PptFinalizeRequest }
  | { ok: false; error: string };

export function getExtension(name: string): string {
  const match = /\.[^./\\]+$/.exec(name);
  return match ? match[0].toLowerCase() : "";
}

/** Synchronous checks: extension, empty file, size. */
export function validateFileBasics(file: { name: string; size: number }): FileValidation {
  if (!(ACCEPTED_EXTENSIONS as readonly string[]).includes(getExtension(file.name))) {
    return { ok: false, code: "unsupported-type" };
  }
  if (file.size === 0) return { ok: false, code: "empty-file" };
  if (file.size > MAX_FILE_BYTES) return { ok: false, code: "file-too-large" };
  return { ok: true };
}

const OLE_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];

/** Cheap client-side signal only; the server does the authoritative check. */
export async function validateFileSignature(file: File): Promise<FileValidation> {
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const isZip = head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04;
  const isOle = head.length === 8 && OLE_SIGNATURE.every((byte, i) => head[i] === byte);
  return isZip || isOle ? { ok: true } : { ok: false, code: "invalid-file" };
}

export async function validatePowerPointFile(file: File): Promise<FileValidation> {
  const basics = validateFileBasics(file);
  if (!basics.ok) return basics;
  return validateFileSignature(file);
}

function fail(error: string): RangeResult {
  return { ok: false, error };
}

/** Parses "1-5, 8, 10-12" (1-based). Dedupes, keeps the order the user typed. */
export function parseSlideRange(input: string, slideCount: number): RangeResult {
  const text = input.trim();
  if (!text) return fail("Enter the slides to convert, for example 1-5, 8.");

  const seen = new Set<number>();
  const slides: number[] = [];

  for (const rawToken of text.split(",")) {
    const token = rawToken.trim();
    if (!token) return fail("Remove the extra comma — each entry needs a slide number or range.");

    const match = /^(\d{1,6})(?:\s*-\s*(\d{1,6}))?$/.exec(token);
    if (!match) return fail(`"${token}" isn't a valid slide number or range.`);

    const start = Number(match[1]);
    const isRange = match[2] !== undefined;
    const end = isRange ? Number(match[2]) : start;

    if (start < 1 || end < 1) return fail("Slide numbers start at 1.");
    if (isRange && start > end) return fail(`"${token}" is backwards — write it as ${end}-${start}.`);
    if (end > slideCount) {
      return fail(
        `Slide ${end} doesn't exist — this presentation has ${slideCount} slide${slideCount === 1 ? "" : "s"}.`,
      );
    }

    for (let n = start; n <= end; n++) {
      if (!seen.has(n)) {
        seen.add(n);
        slides.push(n);
      }
    }
  }
  return { ok: true, slides };
}

export function validateSettings(settings: PptSettings, slideCount: number): SettingsValidation {
  let slides: number[] | null = null;
  if (settings.selection.mode === "custom") {
    const parsed = parseSlideRange(settings.selection.input, slideCount);
    if (!parsed.ok) return parsed;
    slides = parsed.slides;
  }
  return {
    ok: true,
    request: {
      slides,
      pageSize: settings.pageSize,
      orientation: settings.orientation,
      includeHidden: settings.includeHidden,
    },
  };
}
