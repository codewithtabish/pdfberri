// src/components/pages/tools/pdf-to-word/pdf-to-word-ocr.ts

import type { PDFPageProxy } from "pdfjs-dist";
import type { Worker as TesseractWorker } from "tesseract.js";
import { OCR_LANGUAGES } from "./pdf-to-word-constants";
import { ConversionError, type RawItem } from "./pdf-to-word-types";
import { cleanText, isRtlText, throwIfAborted } from "./pdf-to-word-utils";

export interface OcrPageResult {
  items: RawItem[];
  charCount: number;
  confidence: number;
}

export interface OcrSession {
  recognizePage: (page: PDFPageProxy) => Promise<OcrPageResult>;
  dispose: () => Promise<void>;
}

interface OcrLine {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

function collectLines(data: unknown): OcrLine[] {
  const d = data as {
    blocks?: Array<{ paragraphs?: Array<{ lines?: OcrLine[] }> }> | null;
    lines?: OcrLine[];
  };
  const out: OcrLine[] = [];
  if (Array.isArray(d.blocks)) {
    for (const block of d.blocks) {
      for (const paragraph of block.paragraphs ?? []) {
        for (const line of paragraph.lines ?? []) out.push(line);
      }
    }
  } else if (Array.isArray(d.lines)) {
    out.push(...d.lines);
  }
  return out.filter(
    (l) => l && typeof l.text === "string" && l.text.trim() && l.bbox,
  );
}

async function renderForOcr(page: PDFPageProxy) {
  const base = page.getViewport({ scale: 1 });
  const scale = Math.max(
    1,
    Math.min(
      3,
      Math.max(1.5, 2000 / base.width),
      Math.sqrt(16_000_000 / (base.width * base.height)),
    ),
  );
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new ConversionError(
      "ocr-failed",
      "Your browser could not prepare the page for text recognition.",
    );
  }
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return { canvas, scale };
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 11;
}

export async function createOcrSession(
  language: string,
  signal?: AbortSignal,
): Promise<OcrSession> {
  const lang = OCR_LANGUAGES.some((l) => l.code === language)
    ? language
    : "eng";
  throwIfAborted(signal);

  const { createWorker } = await import("tesseract.js");
  const worker: TesseractWorker = await createWorker(lang, 1).catch(() => {
    throw new ConversionError(
      "ocr-failed",
      "Text recognition could not start. OCR language data is downloaded once, so please check your internet connection and try again.",
    );
  });

  const onAbort = () => {
    void worker.terminate();
  };
  signal?.addEventListener("abort", onAbort, { once: true });

  return {
    async recognizePage(page) {
      const { canvas, scale } = await renderForOcr(page);
      try {
        const result = await worker.recognize(canvas, {}, { blocks: true });
        const lines = collectLines(result.data);

        const sizes = lines.map((l) =>
          Math.min(48, Math.max(6, ((l.bbox.y1 - l.bbox.y0) / scale) * 0.85)),
        );
        const med = median(sizes);

        const items: RawItem[] = lines.map((line, i) => {
          const rawSize = sizes[i] ?? med;
          const size =
            Math.abs(rawSize - med) <= med * 0.15 ? med : rawSize;
          const height = (line.bbox.y1 - line.bbox.y0) / scale;
          const text = cleanText(line.text).trim();
          return {
            text,
            x: line.bbox.x0 / scale,
            xEnd: line.bbox.x1 / scale,
            baseline: line.bbox.y1 / scale - height * 0.2,
            size: Math.round(size * 10) / 10,
            bold: false,
            italic: false,
            font: null,
            rtl: isRtlText(text),
          };
        });

        const charCount = items.reduce(
          (sum, it) => sum + it.text.replace(/\s/g, "").length,
          0,
        );
        const confidence = lines.length
          ? lines.reduce((s, l) => s + (l.confidence ?? 0), 0) / lines.length
          : 0;

        return { items, charCount, confidence };
      } catch (error) {
        if (signal?.aborted) {
          throw new ConversionError("cancelled", "Conversion cancelled.");
        }
        if (error instanceof ConversionError) throw error;
        throw new ConversionError(
          "ocr-failed",
          `Text recognition failed on page ${page.pageNumber}. Please try again.`,
        );
      } finally {
        canvas.width = 0;
        canvas.height = 0;
      }
    },
    async dispose() {
      signal?.removeEventListener("abort", onAbort);
      await worker.terminate().catch(() => undefined);
    },
  };
}