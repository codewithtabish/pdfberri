// src/components/pages/tools/word-to-pdf/word-to-pdf-validation.ts
//
// Isomorphic: runs in the browser and in the server route.

import {
  ALLOWED_INPUT_MIME_TYPES,
  WORD_TO_PDF_LIMITS,
} from "./word-to-pdf-constants";
import { toWordToPdfError, WordToPdfError } from "./word-to-pdf-errors";
import type {
  ValidatedWordFile,
  WordFormat,
  WordToPdfLimits,
} from "./word-to-pdf-types";
import {
  formatBytes,
  getExtension,
  toSafeBaseName,
} from "./word-to-pdf-utils";
import {
  inspectZipBlob,
  OLE_SIGNATURE,
  startsWithBytes,
  ZIP_LOCAL_SIGNATURE,
  ZipFormatError,
} from "./word-to-pdf-zip";

export type ValidationResult =
  | { ok: true; value: ValidatedWordFile }
  | { ok: false; error: WordToPdfError };

const MAIN_PART = /^word\/document[^/]*\.xml$/i;

function isUnsafeEntryName(name: string): boolean {
  const normalised = name.replace(/\\/g, "/");
  return (
    normalised.startsWith("/") ||
    /^[a-zA-Z]:/.test(normalised) ||
    normalised.split("/").includes("..")
  );
}

async function assertValidDocxPackage(
  file: Blob,
  limits: WordToPdfLimits,
): Promise<void> {
  let inspection;
  try {
    inspection = await inspectZipBlob(file);
  } catch (error) {
    if (error instanceof ZipFormatError) {
      throw new WordToPdfError("CORRUPT_DOCUMENT");
    }
    throw error;
  }

  const { entries, totalUncompressedBytes } = inspection;

  if (entries.length === 0) throw new WordToPdfError("CORRUPT_DOCUMENT");
  if (
    entries.length > limits.maxZipEntries ||
    totalUncompressedBytes > limits.maxUncompressedBytes
  ) {
    throw new WordToPdfError("UNSAFE_ARCHIVE");
  }

  let hasContentTypes = false;
  let mainPart: (typeof entries)[number] | undefined;

  for (const entry of entries) {
    if (isUnsafeEntryName(entry.name)) throw new WordToPdfError("UNSAFE_ARCHIVE");
    if (entry.encrypted) throw new WordToPdfError("PASSWORD_PROTECTED_OR_LEGACY");
    if (/^word\/vbaProject\.bin$/i.test(entry.name)) {
      throw new WordToPdfError("UNSAFE_ARCHIVE");
    }
    if (
      entry.uncompressedSize >= limits.ratioCheckMinBytes &&
      entry.uncompressedSize / Math.max(entry.compressedSize, 1) >
        limits.maxCompressionRatio
    ) {
      throw new WordToPdfError("UNSAFE_ARCHIVE");
    }
    if (entry.name === "[Content_Types].xml") hasContentTypes = true;
    if (!mainPart && MAIN_PART.test(entry.name)) mainPart = entry;
  }

  if (!hasContentTypes || !mainPart || mainPart.uncompressedSize === 0) {
    throw new WordToPdfError("CORRUPT_DOCUMENT");
  }
}

async function validateInternal(
  file: File,
  limits: WordToPdfLimits,
): Promise<ValidatedWordFile> {
  const extension = getExtension(file.name);
  if (extension !== "docx" && extension !== "doc") {
    throw new WordToPdfError("UNSUPPORTED_TYPE");
  }
  const format: WordFormat = extension;

  if (file.size === 0) throw new WordToPdfError("EMPTY_FILE");

  const maxBytes = format === "docx" ? limits.maxFileBytes : limits.maxLegacyFileBytes;
  if (file.size > maxBytes) {
    throw new WordToPdfError("FILE_TOO_LARGE", formatBytes(maxBytes));
  }

  if (!ALLOWED_INPUT_MIME_TYPES.has(file.type.toLowerCase())) {
    throw new WordToPdfError("UNSUPPORTED_TYPE");
  }

  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const isZip = startsWithBytes(head, ZIP_LOCAL_SIGNATURE);
  const isOle = startsWithBytes(head, OLE_SIGNATURE);

  if (format === "docx") {
    if (isOle) throw new WordToPdfError("PASSWORD_PROTECTED_OR_LEGACY");
    if (!isZip) throw new WordToPdfError("CORRUPT_DOCUMENT");
    await assertValidDocxPackage(file, limits);
  } else {
    if (isZip) throw new WordToPdfError("EXTENSION_MISMATCH");
    if (!isOle) throw new WordToPdfError("CORRUPT_DOCUMENT");
  }

  const baseName = toSafeBaseName(file.name);
  return {
    file,
    format,
    baseName,
    safeName: `${baseName}.${format}`,
    sizeBytes: file.size,
  };
}

export async function validateWordFile(
  file: File,
  limits: WordToPdfLimits = WORD_TO_PDF_LIMITS,
): Promise<ValidationResult> {
  try {
    return { ok: true, value: await validateInternal(file, limits) };
  } catch (error) {
    return { ok: false, error: toWordToPdfError(error) };
  }
}
