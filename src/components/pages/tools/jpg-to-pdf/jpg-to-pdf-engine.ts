import {
  PDFDocument,
  clip,
  degrees,
  endPath,
  popGraphicsState,
  pushGraphicsState,
  rectangle,
} from "pdf-lib";
import { LIMITS, QUALITY_PROFILES } from "./jpg-to-pdf-config";
import {
  ConversionCancelledError,
  ConversionError,
  reencodeToJpeg,
  throwIfAborted,
} from "./jpg-to-pdf-image-loader";
import {
  computePageLayout,
  exifRotationCw,
  isMirroredOrientation,
  placeRotatedImage,
} from "./jpg-to-pdf-layout";
import type {
  ConversionProgress,
  ConversionResult,
  ImageItem,
  ImageKind,
  PdfSettings,
} from "./jpg-to-pdf-types";
import { buildOutputFileName, formatBytes, yieldToMain } from "./jpg-to-pdf-utils";

export { ConversionCancelledError, ConversionError };

export interface CreatePdfOptions {
  signal?: AbortSignal;
  onProgress?: (progress: ConversionProgress) => void;
}

interface PreparedImage {
  bytes: Uint8Array;
  kind: ImageKind;
  /** Pixel size of `bytes` as stored. */
  width: number;
  height: number;
  /** Clockwise rotation to apply when drawing. */
  rotationCw: number;
}

/**
 * Chooses the cheapest correct way to get embeddable bytes: the original
 * file bytes whenever possible, a single decode + re-encode only when the
 * image must be resized or has a mirrored EXIF orientation.
 */
async function prepareImage(
  item: ImageItem,
  settings: PdfSettings,
  signal?: AbortSignal,
): Promise<PreparedImage> {
  const profile = QUALITY_PROFILES[settings.quality];
  const mirrored = isMirroredOrientation(item.exifOrientation);
  const longSide = Math.max(item.width, item.height);
  const needsResize = profile !== null && longSide > profile.maxSide;

  if (mirrored || needsResize) {
    const maxSide = needsResize && profile ? profile.maxSide : longSide;
    const quality = profile ? profile.jpegQuality : 0.92;
    const encoded = await reencodeToJpeg(item.file, maxSide, quality, signal);
    return { ...encoded, kind: "jpg", rotationCw: item.rotation };
  }

  const bytes = new Uint8Array(await item.file.arrayBuffer());
  return {
    bytes,
    kind: item.kind,
    width: item.width,
    height: item.height,
    rotationCw: (exifRotationCw(item.exifOrientation) + item.rotation) % 360,
  };
}

function reportProgress(
  options: CreatePdfOptions,
  progress: Omit<ConversionProgress, "fraction"> & { fraction?: number },
) {
  options.onProgress?.({
    ...progress,
    fraction: progress.fraction ?? progress.current / Math.max(1, progress.total),
  });
}

/** Builds the PDF in the browser. One image is processed at a time. */
export async function createPdf(
  items: readonly ImageItem[],
  settings: PdfSettings,
  options: CreatePdfOptions = {},
): Promise<ConversionResult> {
  const { signal } = options;
  if (items.length === 0) {
    throw new ConversionError("Add at least one image to create a PDF.");
  }

  const doc = await PDFDocument.create();
  doc.setProducer("PDFBerri");
  doc.setCreator("PDFBerri");
  doc.setCreationDate(new Date());

  const total = items.length;
  for (let index = 0; index < total; index++) {
    const item = items[index];
    throwIfAborted(signal);
    reportProgress(options, {
      stage: "preparing",
      current: index + 1,
      total,
      fileName: item.name,
      fraction: index / total,
    });
    await yieldToMain();

    let prepared: PreparedImage;
    try {
      prepared = await prepareImage(item, settings, signal);
    } catch (error) {
      if (error instanceof ConversionCancelledError) throw error;
      const detail = error instanceof ConversionError ? ` ${error.message}` : "";
      throw new ConversionError(`"${item.name}" could not be processed.${detail}`);
    }
    throwIfAborted(signal);

    try {
      const embedded =
        prepared.kind === "jpg"
          ? await doc.embedJpg(prepared.bytes)
          : await doc.embedPng(prepared.bytes);

      const swapped = prepared.rotationCw % 180 !== 0;
      const effectiveWidth = swapped ? prepared.height : prepared.width;
      const effectiveHeight = swapped ? prepared.width : prepared.height;

      const layout = computePageLayout(effectiveWidth, effectiveHeight, settings);
      const page = doc.addPage([layout.pageWidth, layout.pageHeight]);
      const placed = placeRotatedImage(layout.image, prepared.rotationCw);
      const needsClip = settings.fitMode === "cover";

      if (needsClip) {
        const { content } = layout;
        page.pushOperators(
          pushGraphicsState(),
          rectangle(content.x, content.y, content.width, content.height),
          clip(),
          endPath(),
        );
      }
      page.drawImage(embedded, {
        x: placed.x,
        y: placed.y,
        width: placed.width,
        height: placed.height,
        rotate: degrees(placed.angle),
      });
      if (needsClip) page.pushOperators(popGraphicsState());
    } catch (error) {
      if (error instanceof ConversionCancelledError) throw error;
      throw new ConversionError(`"${item.name}" could not be added to the PDF. The image may be damaged.`);
    }

    reportProgress(options, {
      stage: "embedding",
      current: index + 1,
      total,
      fileName: item.name,
      fraction: (index + 1) / total,
    });
    // `prepared` goes out of scope here, so its bytes can be garbage collected.
  }

  throwIfAborted(signal);
  reportProgress(options, { stage: "saving", current: total, total, fileName: null, fraction: 1 });
  await yieldToMain();

  const pdfBytes = await doc.save();
  throwIfAborted(signal);

  if (pdfBytes.byteLength === 0 || doc.getPageCount() === 0) {
    throw new ConversionError("The PDF came out empty. Please try again.");
  }
  if (pdfBytes.byteLength > LIMITS.maxOutputBytes) {
    throw new ConversionError(
      `The PDF would be ${formatBytes(pdfBytes.byteLength)}, above the ${formatBytes(LIMITS.maxOutputBytes)} limit. Try fewer images or the Standard quality.`,
    );
  }

  const blob = new Blob([pdfBytes.slice()], { type: "application/pdf" });
  if (blob.size === 0) throw new ConversionError("The PDF file could not be created.");

  return {
    blob,
    fileName: buildOutputFileName(items.map((item) => item.name)),
    size: blob.size,
    pageCount: doc.getPageCount(),
    pageSize: settings.pageSize,
    orientation: settings.orientation,
  };
}
