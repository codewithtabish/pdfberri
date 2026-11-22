// src/components/pages/tools/pdf-to-word/pdf-to-word-pdfjs.ts

import type { PDFDocumentProxy } from "pdfjs-dist";
import { PDF_TO_WORD_LIMITS } from "./pdf-to-word-constants";
import { ConversionError, type PdfInspection } from "./pdf-to-word-types";
import { throwIfAborted } from "./pdf-to-word-utils";

export type PdfjsModule = typeof import("pdfjs-dist");

let pdfjsPromise: Promise<PdfjsModule> | null = null;

export function loadPdfjs(): Promise<PdfjsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist")
      .then((mod) => {
        mod.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
        return mod;
      })
      .catch((error: unknown) => {
        pdfjsPromise = null;
        throw error;
      });
  }
  return pdfjsPromise;
}

function mapPdfError(error: unknown, signal?: AbortSignal): ConversionError {
  if (signal?.aborted) {
    return new ConversionError("cancelled", "Conversion cancelled.");
  }
  const err = error as { name?: string; code?: number } | null;
  if (err?.name === "PasswordException") {
    return err.code === 2
      ? new ConversionError(
          "incorrect-password",
          "That password is incorrect. Please try again.",
        )
      : new ConversionError(
          "password-required",
          "This PDF is password protected.",
        );
  }
  return new ConversionError(
    "corrupt-pdf",
    "This PDF could not be read. It may be damaged or use an unsupported feature.",
  );
}

export interface OpenPdf {
  pdf: PDFDocumentProxy;
  destroy: () => Promise<void>;
}

/** Re-reads the file each time, so the original is never touched or detached. */
export async function openPdf(
  file: File,
  password: string | undefined,
  signal?: AbortSignal,
): Promise<OpenPdf> {
  const pdfjs = await loadPdfjs();
  throwIfAborted(signal);

  const data = new Uint8Array(await file.arrayBuffer());
  const task = pdfjs.getDocument({
    data,
    password,
    isEvalSupported: false,
    enableXfa: false,
  });

  const onAbort = () => {
    void task.destroy();
  };
  signal?.addEventListener("abort", onAbort, { once: true });

  try {
    const pdf = await task.promise;
    return {
      pdf,
      destroy: async () => {
        signal?.removeEventListener("abort", onAbort);
        await task.destroy();
      },
    };
  } catch (error) {
    signal?.removeEventListener("abort", onAbort);
    void task.destroy();
    throw mapPdfError(error, signal);
  }
}

export async function inspectPdf(
  file: File,
  password: string | undefined,
  signal?: AbortSignal,
): Promise<PdfInspection> {
  const { pdf, destroy } = await openPdf(file, password, signal);
  try {
    const pageCount = pdf.numPages;
    if (pageCount > PDF_TO_WORD_LIMITS.maxPages) {
      throw new ConversionError(
        "too-many-pages",
        `This PDF has ${pageCount} pages. The maximum supported is ${PDF_TO_WORD_LIMITS.maxPages} pages.`,
      );
    }

    const first = await pdf.getPage(1);
    const viewport = first.getViewport({ scale: 1 });
    first.cleanup();

    let title: string | null = null;
    try {
      const meta = await pdf.getMetadata();
      const info = meta.info as Record<string, unknown> | undefined;
      if (typeof info?.Title === "string" && info.Title.trim()) {
        title = info.Title.trim().slice(0, 200);
      }
    } catch {
      title = null;
    }

    const sampleSize = Math.min(pageCount, 40);
    const indices = Array.from({ length: sampleSize }, (_, k) =>
      sampleSize === 1
        ? 1
        : Math.round(1 + (k * (pageCount - 1)) / (sampleSize - 1)),
    );

    let textPages = 0;
    for (const index of indices) {
      throwIfAborted(signal);
      const page = await pdf.getPage(index);
      try {
        const content = await page.getTextContent();
        let chars = 0;
        for (const item of content.items) {
          if ("str" in item) chars += item.str.replace(/\s/g, "").length;
        }
        if (chars >= PDF_TO_WORD_LIMITS.minTextCharsPerPage) textPages += 1;
      } finally {
        page.cleanup();
      }
    }

    const scannedPages = sampleSize - textPages;
    return {
      pageCount,
      pageWidth: viewport.width,
      pageHeight: viewport.height,
      title,
      sampledPages: sampleSize,
      textPages,
      scannedPages,
      hasExtractableText: textPages > 0,
      likelyScanned: scannedPages / sampleSize >= 0.5,
    };
  } finally {
    await destroy();
  }
}