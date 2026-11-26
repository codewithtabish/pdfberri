import { MAX_FILE_SIZE_BYTES } from "./pdf-to-powerpoint-constants";
import { ConverterError } from "./pdf-to-powerpoint-errors";

export async function assertValidPdfFile(file: File): Promise<void> {
  if (!/\.pdf$/i.test(file.name)) throw new ConverterError("INVALID_FILE");
  if (file.size === 0) throw new ConverterError("EMPTY");
  if (file.size > MAX_FILE_SIZE_BYTES) throw new ConverterError("TOO_LARGE");
  if (
    file.type &&
    file.type !== "application/pdf" &&
    file.type !== "application/octet-stream" &&
    file.type !== "application/x-pdf"
  ) {
    throw new ConverterError("INVALID_FILE");
  }
  const head = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  let text = "";
  for (const byte of head) text += String.fromCharCode(byte);
  if (!text.includes("%PDF-")) throw new ConverterError("INVALID_FILE");
}

export type RangeParseResult =
  | { ok: true; pages: number[] } // zero-based, ascending (source order)
  | { ok: false; error: string };

export function parsePageRanges(input: string, pageCount: number): RangeParseResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "Enter pages like 1,3,5-8,12." };

  const pages = new Set<number>();
  for (const rawToken of trimmed.split(",")) {
    const token = rawToken.trim();
    if (!token) return { ok: false, error: "Remove the extra comma." };

    const single = /^\d+$/.exec(token);
    const range = /^(\d+)\s*-\s*(\d+)$/.exec(token);
    if (!single && !range) {
      return { ok: false, error: `"${token}" isn't a valid page or range.` };
    }

    const start = Number(single ? single[0] : range?.[1]);
    const end = Number(single ? single[0] : range?.[2]);

    if (start < 1 || end < 1 || start > pageCount || end > pageCount) {
      return {
        ok: false,
        error: `"${token}" is outside this document (pages 1–${pageCount}).`,
      };
    }
    if (start > end) {
      return { ok: false, error: `Range "${token}" is backwards.` };
    }
    for (let page = start; page <= end; page += 1) pages.add(page - 1);
  }

  return { ok: true, pages: [...pages].sort((a, b) => a - b) };
}
