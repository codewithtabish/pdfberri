import type { PDFDocumentProxy } from "pdfjs-dist";
import JSZip from "jszip";

import { PDF_TO_JPG_CONFIG, QUALITY_PRESETS } from "./pdf-to-jpg-config";
import type {
  ConversionSettings,
  ConversionResult,
  OutputImage,
} from "./pdf-to-jpg-types";
import { PdfToJpgError, sanitizeFilename } from "./pdf-to-jpg-utils";

export interface RenderProgress {
  currentPage: number;
  totalPages: number;
}

export async function convertPdfToJpg(
  pdf: PDFDocumentProxy,
  baseFilename: string,
  pages: number[],
  settings: ConversionSettings,
  onProgress: (progress: RenderProgress) => void,
  signal: AbortSignal
): Promise<ConversionResult> {
  if (signal.aborted) {
    throw new PdfToJpgError("Conversion cancelled.");
  }

  if (pages.length === 0) {
    throw new PdfToJpgError("Please select at least one page.");
  }

  const quality = QUALITY_PRESETS[settings.quality];
  const scale = settings.resolution / 72;
  const total = pages.length;
  const images: OutputImage[] = [];

  const safeFilename = sanitizeFilename(baseFilename);

  for (let i = 0; i < total; i++) {
    if (signal.aborted) {
      throw new PdfToJpgError("Conversion cancelled.");
    }

    const pageNum = pages[i];

    if (
      !Number.isInteger(pageNum) ||
      pageNum < 1 ||
      pageNum > pdf.numPages
    ) {
      throw new PdfToJpgError(`Invalid page number: ${pageNum}.`);
    }

    onProgress({
      currentPage: i + 1,
      totalPages: total,
    });

    let canvas: HTMLCanvasElement | null = null;
    let page: Awaited<ReturnType<PDFDocumentProxy["getPage"]>> | null = null;

    try {
      page = await pdf.getPage(pageNum);

      if (signal.aborted) {
        throw new PdfToJpgError("Conversion cancelled.");
      }

      const viewport = page.getViewport({ scale });

      const width = Math.ceil(viewport.width);
      const height = Math.ceil(viewport.height);

      if (
        !Number.isFinite(width) ||
        !Number.isFinite(height) ||
        width <= 0 ||
        height <= 0 ||
        width * height > PDF_TO_JPG_CONFIG.maxPixelArea
      ) {
        throw new PdfToJpgError(
          `Page ${pageNum} at ${settings.resolution} DPI is too large to process safely. Try a lower resolution.`
        );
      }

      canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d", { alpha: false });

      if (!ctx) {
        throw new PdfToJpgError("Could not create canvas context.");
      }

      const renderTask = page.render({
        canvas,
        canvasContext: ctx,
        viewport,
      });

      const abortRender = () => {
        renderTask.cancel();
      };

      signal.addEventListener("abort", abortRender, { once: true });

      try {
        await renderTask.promise;
      } catch (error: unknown) {
        if (
          signal.aborted ||
          (error instanceof Error &&
            error.name === "RenderingCancelledException")
        ) {
          throw new PdfToJpgError("Conversion cancelled.");
        }

        throw new PdfToJpgError(
          `Failed to render page ${pageNum}.`
        );
      } finally {
        signal.removeEventListener("abort", abortRender);
      }

      if (signal.aborted) {
        throw new PdfToJpgError("Conversion cancelled.");
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas!.toBlob(
          (result) => {
            if (result) {
              resolve(result);
            } else {
              reject(
                new PdfToJpgError(
                  `Failed to create JPEG image for page ${pageNum}.`
                )
              );
            }
          },
          "image/jpeg",
          quality
        );
      });

      if (signal.aborted) {
        throw new PdfToJpgError("Conversion cancelled.");
      }

      if (blob.size === 0) {
        throw new PdfToJpgError(
          `Generated JPG for page ${pageNum} is empty.`
        );
      }

      images.push({
        pageNumber: pageNum,
        filename: `${safeFilename}-page-${String(pageNum).padStart(3, "0")}.jpg`,
        blob,
        width,
        height,
        size: blob.size,
      });
    } finally {
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }

      page?.cleanup();
    }
  }

  if (signal.aborted) {
    throw new PdfToJpgError("Conversion cancelled.");
  }

  let zipBlob: Blob | null = null;
  let zipFilename = "";

  if (images.length > 1) {
    const zip = new JSZip();

    for (const image of images) {
      if (signal.aborted) {
        throw new PdfToJpgError("Conversion cancelled.");
      }

      zip.file(image.filename, image.blob);
    }

    try {
      zipBlob = await zip.generateAsync(
        { type: "blob" },
        (metadata) => {
          if (signal.aborted) {
            return;
          }

          // ZIP generation progress can be connected to a separate
          // packaging-progress callback if the UI supports it.
          void metadata;
        }
      );

      if (signal.aborted) {
        throw new PdfToJpgError("Conversion cancelled.");
      }

      zipFilename = `${safeFilename}-jpg-images.zip`;
    } catch (error: unknown) {
      if (signal.aborted) {
        throw new PdfToJpgError("Conversion cancelled.");
      }

      if (error instanceof PdfToJpgError) {
        throw error;
      }

      throw new PdfToJpgError("Failed to package JPG images into ZIP.");
    }
  }

  return {
    images,
    zipBlob,
    zipFilename,
  };
}