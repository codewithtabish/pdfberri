import {
  ALLOWED_EXTENSIONS,
  LIMITS,
} from "./jpg-to-pdf-config";
import type { ExifOrientation, ImageHeader } from "./jpg-to-pdf-types";
import { formatBytes, getExtension } from "./jpg-to-pdf-utils";

export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageValidationError";
  }
}

const HEAD_BYTES = 1024 * 1024;

/** Cheap checks that need no file reading. Returns a message or null. */
export function validateFileBasics(
  file: File,
  currentCount: number,
  currentBytes: number,
): string | null {
  const extension = getExtension(file.name);
  if (!(ALLOWED_EXTENSIONS as readonly string[]).includes(extension)) {
    return "Unsupported file type. Use a .jpg, .jpeg or .png image.";
  }
  if (file.size === 0) return "This file is empty.";

  const type = file.type.toLowerCase();
  if (type) {
    const isJpegType = type === "image/jpeg" || type === "image/pjpeg";
    const isPngType = type === "image/png";
    if (!isJpegType && !isPngType) {
      return `Unsupported file type (${type}). Use a JPG, JPEG or PNG image.`;
    }
    const wantsJpeg = extension === "jpg" || extension === "jpeg";
    if ((wantsJpeg && !isJpegType) || (!wantsJpeg && !isPngType)) {
      return "The file extension does not match the file type.";
    }
  }
  if (file.size > LIMITS.maxFileBytes) {
    return `This file is ${formatBytes(file.size)}. The limit is ${formatBytes(LIMITS.maxFileBytes)} per image.`;
  }
  if (currentCount >= LIMITS.maxImages) {
    return `You can add up to ${LIMITS.maxImages} images at a time.`;
  }
  if (currentBytes + file.size > LIMITS.maxTotalBytes) {
    return `Adding this file would exceed the ${formatBytes(LIMITS.maxTotalBytes)} total limit.`;
  }
  return null;
}

type ParsedHeader = Pick<ImageHeader, "width" | "height" | "exifOrientation">;

function readU16(view: DataView, offset: number, little: boolean): number {
  return view.getUint16(offset, little);
}

function readExifOrientation(bytes: Uint8Array, segmentStart: number, segmentEnd: number): ExifOrientation {
  // segmentStart points at "Exif\0\0"
  const isExif =
    bytes[segmentStart] === 0x45 &&
    bytes[segmentStart + 1] === 0x78 &&
    bytes[segmentStart + 2] === 0x69 &&
    bytes[segmentStart + 3] === 0x66 &&
    bytes[segmentStart + 4] === 0 &&
    bytes[segmentStart + 5] === 0;
  if (!isExif) return 1;

  const tiff = segmentStart + 6;
  if (tiff + 8 > segmentEnd) return 1;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const order = readU16(view, tiff, false);
  const little = order === 0x4949;
  if (!little && order !== 0x4d4d) return 1;

  const ifd = tiff + view.getUint32(tiff + 4, little);
  if (ifd + 2 > segmentEnd) return 1;
  const entries = readU16(view, ifd, little);
  for (let i = 0; i < entries; i++) {
    const entry = ifd + 2 + i * 12;
    if (entry + 12 > segmentEnd) return 1;
    if (readU16(view, entry, little) === 0x0112) {
      const value = readU16(view, entry + 8, little);
      return value >= 1 && value <= 8 ? (value as ExifOrientation) : 1;
    }
  }
  return 1;
}

/** Returns null when more data is needed to find the dimensions. */
function parseJpeg(bytes: Uint8Array): ParsedHeader | null {
  let exifOrientation: ExifOrientation = 1;
  let i = 2;
  while (i + 4 <= bytes.length) {
    if (bytes[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = bytes[i + 1];
    if (marker === 0xff) {
      i++;
      continue;
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) {
      throw new ImageValidationError("The JPEG data is damaged (no image size found).");
    }
    const length = (bytes[i + 2] << 8) | bytes[i + 3];
    if (length < 2) {
      throw new ImageValidationError("The JPEG data is damaged.");
    }
    if (i + 2 + length > bytes.length) return null;

    if (marker === 0xe1) {
      exifOrientation = readExifOrientation(bytes, i + 4, i + 2 + length);
    }
    const isSof =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) {
      if (length < 8) throw new ImageValidationError("The JPEG data is damaged.");
      const height = (bytes[i + 5] << 8) | bytes[i + 6];
      const width = (bytes[i + 7] << 8) | bytes[i + 8];
      return { width, height, exifOrientation };
    }
    i += 2 + length;
  }
  return null;
}

function parsePng(bytes: Uint8Array): ParsedHeader {
  if (bytes.length < 24) throw new ImageValidationError("The PNG data is damaged.");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const isIhdr =
    bytes[12] === 0x49 && bytes[13] === 0x48 && bytes[14] === 0x44 && bytes[15] === 0x52;
  if (!isIhdr) throw new ImageValidationError("The PNG data is damaged.");
  return { width: view.getUint32(16), height: view.getUint32(20), exifOrientation: 1 };
}

function detectKind(bytes: Uint8Array): "jpg" | "png" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpg";
  }
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= 8 && png.every((value, index) => bytes[index] === value)) {
    return "png";
  }
  return null;
}

/**
 * Reads only the file header: verifies real content, size and orientation
 * without decoding pixels. Throws ImageValidationError with a readable message.
 */
export async function readImageHeader(file: File): Promise<ImageHeader> {
  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await file.slice(0, HEAD_BYTES).arrayBuffer());
  } catch {
    throw new ImageValidationError("This file could not be read.");
  }

  const kind = detectKind(bytes);
  if (!kind) {
    throw new ImageValidationError("This is not a valid JPG or PNG image.");
  }

  const extension = getExtension(file.name);
  const extensionIsJpeg = extension === "jpg" || extension === "jpeg";
  if ((kind === "jpg") !== extensionIsJpeg) {
    throw new ImageValidationError(
      `The file content is ${kind.toUpperCase()} but the extension is .${extension}.`,
    );
  }

  let parsed: ParsedHeader | null;
  if (kind === "png") {
    parsed = parsePng(bytes);
  } else {
    parsed = parseJpeg(bytes);
    if (!parsed && file.size > bytes.length) {
      try {
        bytes = new Uint8Array(await file.arrayBuffer());
      } catch {
        throw new ImageValidationError("This file could not be read.");
      }
      parsed = parseJpeg(bytes);
    }
    if (!parsed) {
      throw new ImageValidationError("The JPEG data is damaged (no image size found).");
    }
  }

  const { width, height } = parsed;
  if (width < 1 || height < 1) {
    throw new ImageValidationError("The image has no readable size.");
  }
  if (width > LIMITS.maxDimension || height > LIMITS.maxDimension) {
    throw new ImageValidationError(
      `The image is ${width} × ${height} px. The limit is ${LIMITS.maxDimension} px on each side.`,
    );
  }
  if (width * height > LIMITS.maxPixelsPerImage) {
    throw new ImageValidationError(
      `The image has ${(width * height / 1_000_000).toFixed(0)} megapixels. The limit is ${LIMITS.maxPixelsPerImage / 1_000_000} megapixels.`,
    );
  }

  return {
    kind,
    mime: kind === "jpg" ? "image/jpeg" : "image/png",
    width,
    height,
    exifOrientation: parsed.exifOrientation,
  };
}
