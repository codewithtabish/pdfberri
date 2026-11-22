// src/components/pages/tools/pdf-to-word/pdf-to-word-engine.ts
//
// Conversion engine adapter. The UI only talks to convertPdfToWord(), so the
// engine can later be swapped for a server-side converter without UI changes.

import { PDF_TO_WORD_LIMITS } from "./pdf-to-word-constants";
import { buildDocx, validateDocx } from "./pdf-to-word-docx";
import { extractPageContent } from "./pdf-to-word-extract";
import {
  buildPageFlow,
  computeBodySize,
  detectRunningContent,
  emptyRunning,
} from "./pdf-to-word-layout";
import { createOcrSession } from "./pdf-to-word-ocr";
import { loadPdfjs, openPdf } from "./pdf-to-word-pdfjs";
import {
  ConversionError,
  type ConversionOptions,
  type ConversionProgress,
  type ConversionResult,
  type PageContent,
} from "./pdf-to-word-types";
import {
  pluralize,
  sanitizeBaseName,
  throwIfAborted,
  toDocxFileName,
  yieldToMain,
} from "./pdf-to-word-utils";
import { validatePdfFile } from "./pdf-to-word-validation";

export interface ConvertParams {
  file: File;
  options: ConversionOptions;
  password?: string;
  signal?: AbortSignal;
  onProgress?: (progress: ConversionProgress) => void;
}

export async function convertPdfToWord(
  params: ConvertParams,
): Promise<ConversionResult> {
  const { file, options, password, signal, onProgress } = params;
  const started = performance.now();
  const warnings: string[] = [];
  const report = (p: ConversionProgress) => onProgress?.(p);
  const { minTextCharsPerPage, maxPages, maxOcrPages } = PDF_TO_WORD_LIMITS;

  try {
    await validatePdfFile(file);
    report({ stage: "reading", current: 0, total: 1 });

    const pdfjs = await loadPdfjs();
    const { pdf, destroy } = await openPdf(file, password, signal);

    const pages: PageContent[] = [];
    let ocrPages = 0;

    try {
      const total = pdf.numPages;
      if (total > maxPages) {
        throw new ConversionError(
          "too-many-pages",
          `This PDF has ${total} pages. The maximum supported is ${maxPages} pages.`,
        );
      }

      // 1) Extract text, fonts and images
      for (let n = 1; n <= total; n += 1) {
        throwIfAborted(signal);
        report({ stage: "extracting", current: n, total });
        const page = await pdf.getPage(n);
        try {
          pages.push(await extractPageContent(pdfjs, page, n));
        } finally {
          page.cleanup();
        }
        if (n % 3 === 0) await yieldToMain();
      }

      // 2) OCR for pages without selectable text
      const needsOcr = pages.filter((p) => p.charCount < minTextCharsPerPage);
      if (needsOcr.length > 0) {
        if (options.ocrEnabled) {
          const targets = needsOcr.slice(0, maxOcrPages);
          if (needsOcr.length > targets.length) {
            warnings.push(
              `OCR was applied to the first ${targets.length} scanned pages. The remaining ${needsOcr.length - targets.length} pages were left empty.`,
            );
          }

          const session = await createOcrSession(options.ocrLanguage, signal);
          const lowConfidence: number[] = [];
          try {
            for (let i = 0; i < targets.length; i += 1) {
              throwIfAborted(signal);
              report({ stage: "ocr", current: i + 1, total: targets.length });
              const target = targets[i];
              const page = await pdf.getPage(target.pageNumber);
              try {
                const result = await session.recognizePage(page);
                target.items = result.items;
                target.charCount = result.charCount;
                target.source = result.charCount > 0 ? "ocr" : "none";
                if (result.charCount > 0) {
                  ocrPages += 1;
                  if (result.confidence < 60) lowConfidence.push(target.pageNumber);
                }
              } finally {
                page.cleanup();
              }
              await yieldToMain();
            }
          } finally {
            await session.dispose();
          }

          if (lowConfidence.length > 0) {
            warnings.push(
              `Text recognition confidence was low on ${pluralize(lowConfidence.length, "page")} ${lowConfidence.slice(0, 8).join(", ")}${lowConfidence.length > 8 ? "…" : ""}. Please review that text carefully.`,
            );
          }
          if (ocrPages > 0) {
            warnings.push(
              "Scanned text was recognized with OCR, which is never perfectly accurate. Tables on scanned pages are not rebuilt.",
            );
          }
        } else {
          warnings.push(
            `${needsOcr.length} ${pluralize(needsOcr.length, "page")} contain no selectable text and ${needsOcr.length === 1 ? "was" : "were"} left empty. Turn on OCR to recognize scanned text.`,
          );
        }
      }
    } finally {
      await destroy();
    }

    const totalChars = pages.reduce((s, p) => s + p.charCount, 0);
    const totalImages = pages.reduce((s, p) => s + p.images.length, 0);
    if (totalChars === 0 && totalImages === 0) {
      throw new ConversionError(
        "no-content",
        options.ocrEnabled
          ? "No readable content was found in this PDF."
          : "No selectable text was found in this PDF. If it is a scan, turn on OCR and try again.",
      );
    }

    // 3) Reconstruct structure and write DOCX
    throwIfAborted(signal);
    report({ stage: "building", current: 0, total: 1 });
    await yieldToMain();

    const ctx = {
      bodySize: computeBodySize(pages),
      running:
        options.mode === "editable"
          ? detectRunningContent(pages)
          : emptyRunning(),
    };
    const flows = pages.map((p) => buildPageFlow(p, options.mode, ctx));

    const built = await buildDocx({
      flows,
      mode: options.mode,
      title: sanitizeBaseName(file.name),
      running: ctx.running,
    });

    // 4) Validate output
    throwIfAborted(signal);
    report({ stage: "validating", current: 0, total: 1 });
    await validateDocx(built.blob, built.expectedChars);

    return {
      blob: built.blob,
      fileName: toDocxFileName(file.name),
      size: built.blob.size,
      stats: {
        pages: pages.length,
        paragraphs: built.paragraphs,
        tables: built.tables,
        images: built.images,
        ocrPages,
      },
      warnings,
      durationMs: Math.round(performance.now() - started),
    };
  } catch (error) {
    if (signal?.aborted) {
      throw new ConversionError("cancelled", "Conversion cancelled.");
    }
    throw error;
  }
}