// src/components/pages/tools/word-to-pdf/word-to-pdf-local-engine.ts
//
// Browser engine for DOCX. The document is laid out by docx-preview, each page
// is captured with html2canvas-pro and written to a PDF with pdf-lib.
// The file never leaves the device. The PDF pages are images (text is not
// selectable) and layout depends on fonts available in the browser.

import {
  MAX_CANVAS_PIXELS,
  PDF_MIME,
  QUALITY_PRESETS,
  WORD_TO_PDF_LIMITS,
} from "./word-to-pdf-constants";
import { toWordToPdfError, WordToPdfError } from "./word-to-pdf-errors";
import type {
  ConversionOutput,
  ConversionRequest,
  WordToPdfEngine,
} from "./word-to-pdf-types";
import {
  buildPdfFileName,
  CSS_PX_TO_PT,
  effectiveScale,
  fitContain,
  resolveTargetPageSize,
  throwIfAborted,
  yieldToMain,
} from "./word-to-pdf-utils";

function createRenderHost(): HTMLDivElement {
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.setAttribute("inert", "");
  host.style.cssText =
    "position:fixed;top:0;left:-100000px;width:auto;height:auto;pointer-events:none;color:#000;background:#fff;";
  document.body.appendChild(host);
  return host;
}

async function waitForImages(root: HTMLElement, signal: AbortSignal): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }
          const done = () => resolve();
          image.addEventListener("load", done, { once: true });
          image.addEventListener("error", done, { once: true });
          signal.addEventListener("abort", done, { once: true });
        }),
    ),
  );
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new WordToPdfError("OUT_OF_MEMORY"));
      },
      "image/jpeg",
      quality,
    );
  });
}

async function convertDocx(request: ConversionRequest): Promise<ConversionOutput> {
  const { file, settings, signal, onProgress } = request;
  throwIfAborted(signal);

  onProgress?.({ phase: "reading", message: "Reading your document…" });
  const buffer = await file.file.arrayBuffer();
  throwIfAborted(signal);

  let libs;
  try {
    const [docxPreview, html2canvasModule, pdfLib] = await Promise.all([
      import("docx-preview"),
      import("html2canvas-pro"),
      import("pdf-lib"),
    ]);
    libs = {
      renderAsync: docxPreview.renderAsync,
      html2canvas: html2canvasModule.default,
      PDFDocument: pdfLib.PDFDocument,
    };
  } catch {
    throw new WordToPdfError("ENGINE_UNAVAILABLE");
  }

  const preset = QUALITY_PRESETS[settings.quality];
  const host = createRenderHost();

  try {
    onProgress?.({ phase: "rendering", message: "Laying out your pages…" });

    const styleContainer = document.createElement("div");
    const bodyContainer = document.createElement("div");
    host.append(styleContainer, bodyContainer);

    try {
      await libs.renderAsync(buffer, bodyContainer, styleContainer, {
        className: "docx",
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreFonts: false,
        breakPages: true,
        ignoreLastRenderedPageBreak: true,
        renderHeaders: true,
        renderFooters: true,
        renderFootnotes: true,
        renderEndnotes: true,
        useBase64URL: true,
      });
    } catch (error) {
      if (error instanceof RangeError) throw toWordToPdfError(error);
      throw new WordToPdfError("RENDER_FAILED");
    }
    throwIfAborted(signal);

    await waitForImages(bodyContainer, signal);
    if (document.fonts?.ready) await document.fonts.ready;
    throwIfAborted(signal);

    const wrapper = bodyContainer.querySelector<HTMLElement>(".docx-wrapper");
    if (wrapper) {
      wrapper.style.background = "transparent";
      wrapper.style.padding = "0";
    }
    const pages = Array.from(
      bodyContainer.querySelectorAll<HTMLElement>(".docx-wrapper > section"),
    );
    if (pages.length === 0) throw new WordToPdfError("RENDER_FAILED");
    if (pages.length > WORD_TO_PDF_LIMITS.maxPages) {
      throw new WordToPdfError("TOO_MANY_PAGES", String(WORD_TO_PDF_LIMITS.maxPages));
    }

    const pdf = await libs.PDFDocument.create();
    const total = pages.length;

    for (let index = 0; index < total; index += 1) {
      throwIfAborted(signal);
      onProgress?.({
        phase: "building",
        message: `Converting page ${index + 1} of ${total}…`,
        completed: index,
        total,
      });

      const element = pages[index];
      if (!element) continue;
      element.style.boxShadow = "none";
      element.style.margin = "0";

      const rect = element.getBoundingClientRect();
      const widthPx = Math.max(1, Math.ceil(rect.width));
      const heightPx = Math.max(1, Math.ceil(rect.height));
      const scale = effectiveScale(preset.scale, widthPx, heightPx, MAX_CANVAS_PIXELS);

      let canvas: HTMLCanvasElement;
      try {
        canvas = await libs.html2canvas(element, {
          scale,
          backgroundColor: "#ffffff",
          logging: false,
          useCORS: false,
          allowTaint: false,
          imageTimeout: 15000,
        });
      } catch (error) {
        throw error instanceof WordToPdfError
          ? error
          : error instanceof RangeError
            ? toWordToPdfError(error)
            : new WordToPdfError("RENDER_FAILED");
      }

      let jpegBytes: Uint8Array;
      try {
        const blob = await canvasToJpeg(canvas, preset.jpegQuality);
        jpegBytes = new Uint8Array(await blob.arrayBuffer());
      } finally {
        canvas.width = 0;
        canvas.height = 0;
      }

      const image = await pdf.embedJpg(jpegBytes);
      const contentWidthPt = widthPx * CSS_PX_TO_PT;
      const contentHeightPt = heightPx * CSS_PX_TO_PT;
      const [pageWidth, pageHeight] = resolveTargetPageSize(
        settings.pageSize,
        contentWidthPt,
        contentHeightPt,
      );
      const page = pdf.addPage([pageWidth, pageHeight]);
      page.drawImage(
        image,
        fitContain(contentWidthPt, contentHeightPt, pageWidth, pageHeight),
      );

      await yieldToMain();
    }

    onProgress?.({
      phase: "building",
      message: "Finishing your PDF…",
      completed: total,
      total,
    });

    pdf.setTitle(file.baseName);
    pdf.setProducer("PDFBerri");
    pdf.setCreator("PDFBerri Word to PDF");
    pdf.setCreationDate(new Date());

    const bytes = await pdf.save();
    const blob = new Blob([bytes as unknown as BlobPart], { type: PDF_MIME });

    return {
      blob,
      fileName: buildPdfFileName(file.file.name),
      sizeBytes: blob.size,
      pageCount: total,
      engine: "local",
    };
  } finally {
    host.replaceChildren();
    host.remove();
  }
}

export const localWordToPdfEngine: WordToPdfEngine = {
  id: "local",
  label: "In your browser",
  supportedFormats: ["docx"],
  supportedSettings: ["pageSize", "quality"],
  processesLocally: true,

  async isAvailable() {
    return (
      typeof window !== "undefined" &&
      typeof document !== "undefined" &&
      typeof Blob !== "undefined"
    );
  },

  async convert(request) {
    try {
      return await convertDocx(request);
    } catch (error) {
      throw toWordToPdfError(error);
    }
  },
};
