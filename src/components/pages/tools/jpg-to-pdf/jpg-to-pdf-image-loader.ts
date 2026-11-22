import { LIMITS } from "./jpg-to-pdf-config";

export class ConversionCancelledError extends Error {
  constructor() {
    super("Conversion cancelled");
    this.name = "ConversionCancelledError";
  }
}

export class ConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConversionError";
  }
}

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new ConversionCancelledError();
}

interface DecodedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
}

/** Decodes with EXIF orientation applied. Prefers createImageBitmap. */
async function decodeImage(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      };
    } catch {
      // fall through to the <img> decoder
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      release: () => {
        image.src = "";
      },
    };
  } catch {
    throw new ConversionError("This image could not be decoded. It may be damaged.");
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasToJpegBytes(canvas: HTMLCanvasElement, quality: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new ConversionError("The image could not be re-encoded."));
          return;
        }
        blob.arrayBuffer().then((buffer) => resolve(new Uint8Array(buffer)), reject);
      },
      "image/jpeg",
      quality,
    );
  });
}

export interface ReencodedImage {
  bytes: Uint8Array;
  width: number;
  height: number;
}

/**
 * Decodes one image, scales it so its longest side is at most `maxSide`,
 * and re-encodes it as JPEG on a white background. Releases all temporary
 * memory (bitmap and canvas) before returning.
 */
export async function reencodeToJpeg(
  file: File,
  maxSide: number,
  quality: number,
  signal?: AbortSignal,
): Promise<ReencodedImage> {
  throwIfAborted(signal);
  const decoded = await decodeImage(file);
  try {
    throwIfAborted(signal);
    if (decoded.width < 1 || decoded.height < 1) {
      throw new ConversionError("This image could not be decoded.");
    }
    const scale = Math.min(1, maxSide / Math.max(decoded.width, decoded.height));
    const width = Math.max(1, Math.round(decoded.width * scale));
    const height = Math.max(1, Math.round(decoded.height * scale));
    if (width > LIMITS.maxDimension || height > LIMITS.maxDimension || width * height > LIMITS.maxPixelsPerImage) {
      throw new ConversionError("This image is too large to process in the browser.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    try {
      const context = canvas.getContext("2d");
      if (!context) {
        throw new ConversionError("Your browser could not allocate memory for this image.");
      }
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.imageSmoothingQuality = "high";
      context.drawImage(decoded.source, 0, 0, width, height);
      throwIfAborted(signal);
      const bytes = await canvasToJpegBytes(canvas, quality);
      return { bytes, width, height };
    } finally {
      canvas.width = 0;
      canvas.height = 0;
    }
  } finally {
    decoded.release();
  }
}
