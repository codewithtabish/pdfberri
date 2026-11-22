// src/components/pages/tools/word-to-pdf/word-to-pdf-zip.ts
//
// Minimal, dependency-free ZIP central-directory reader. It never decompresses
// anything: it only reads metadata so a DOCX package can be checked cheaply
// (entry names, sizes, encryption flag) before any heavy processing.
// Works in browsers and Node 18+ (anything with Blob.slice / arrayBuffer).

export interface ZipEntryInfo {
  name: string;
  compressedSize: number;
  uncompressedSize: number;
  encrypted: boolean;
}

export interface ZipInspection {
  entries: ZipEntryInfo[];
  totalUncompressedBytes: number;
}

export type ZipFailureReason = "NOT_ZIP" | "ZIP64" | "TRUNCATED" | "MALFORMED";

export class ZipFormatError extends Error {
  readonly reason: ZipFailureReason;
  constructor(reason: ZipFailureReason) {
    super(reason);
    this.name = "ZipFormatError";
    this.reason = reason;
  }
}

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const EOCD_MIN_SIZE = 22;
const MAX_COMMENT = 0xffff;

export const ZIP_LOCAL_SIGNATURE = [0x50, 0x4b, 0x03, 0x04] as const;
export const OLE_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] as const;

export function startsWithBytes(
  bytes: Uint8Array,
  signature: readonly number[],
): boolean {
  if (bytes.length < signature.length) return false;
  return signature.every((value, index) => bytes[index] === value);
}

function view(bytes: Uint8Array): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

interface EndRecord {
  entryCount: number;
  centralSize: number;
  centralOffset: number;
}

export function findEndRecord(tail: Uint8Array): EndRecord {
  if (tail.length < EOCD_MIN_SIZE) throw new ZipFormatError("NOT_ZIP");
  const dv = view(tail);
  const lowest = Math.max(0, tail.length - EOCD_MIN_SIZE - MAX_COMMENT);

  for (let pos = tail.length - EOCD_MIN_SIZE; pos >= lowest; pos -= 1) {
    if (dv.getUint32(pos, true) !== EOCD_SIGNATURE) continue;
    const entryCount = dv.getUint16(pos + 10, true);
    const centralSize = dv.getUint32(pos + 12, true);
    const centralOffset = dv.getUint32(pos + 16, true);
    if (entryCount === 0xffff || centralSize === 0xffffffff || centralOffset === 0xffffffff) {
      throw new ZipFormatError("ZIP64");
    }
    return { entryCount, centralSize, centralOffset };
  }
  throw new ZipFormatError("NOT_ZIP");
}

export function parseCentralDirectory(
  directory: Uint8Array,
  entryCount: number,
): ZipInspection {
  const dv = view(directory);
  const decoder = new TextDecoder("utf-8");
  const entries: ZipEntryInfo[] = [];
  let total = 0;
  let pos = 0;

  for (let index = 0; index < entryCount; index += 1) {
    if (pos + 46 > directory.length) throw new ZipFormatError("TRUNCATED");
    if (dv.getUint32(pos, true) !== CENTRAL_SIGNATURE) {
      throw new ZipFormatError("MALFORMED");
    }
    const flags = dv.getUint16(pos + 8, true);
    const compressedSize = dv.getUint32(pos + 20, true);
    const uncompressedSize = dv.getUint32(pos + 24, true);
    const nameLength = dv.getUint16(pos + 28, true);
    const extraLength = dv.getUint16(pos + 30, true);
    const commentLength = dv.getUint16(pos + 32, true);

    const nameEnd = pos + 46 + nameLength;
    if (nameEnd > directory.length) throw new ZipFormatError("TRUNCATED");
    const name = decoder.decode(directory.subarray(pos + 46, nameEnd));

    entries.push({
      name,
      compressedSize,
      uncompressedSize,
      encrypted: (flags & 0x1) === 0x1,
    });
    total += uncompressedSize;
    pos = nameEnd + extraLength + commentLength;
  }

  return { entries, totalUncompressedBytes: total };
}

/** Reads only the end and the central directory of the archive (not the whole file). */
export async function inspectZipBlob(blob: Blob): Promise<ZipInspection> {
  if (blob.size < EOCD_MIN_SIZE) throw new ZipFormatError("NOT_ZIP");

  const tailStart = Math.max(0, blob.size - (EOCD_MIN_SIZE + MAX_COMMENT));
  const tail = new Uint8Array(await blob.slice(tailStart).arrayBuffer());
  const end = findEndRecord(tail);

  if (end.centralOffset + end.centralSize > blob.size) {
    throw new ZipFormatError("TRUNCATED");
  }
  // Guard against absurd directory sizes claimed by a hostile file.
  if (end.centralSize > 16 * 1024 * 1024) throw new ZipFormatError("MALFORMED");

  const directory = new Uint8Array(
    await blob.slice(end.centralOffset, end.centralOffset + end.centralSize).arrayBuffer(),
  );
  return parseCentralDirectory(directory, end.entryCount);
}
