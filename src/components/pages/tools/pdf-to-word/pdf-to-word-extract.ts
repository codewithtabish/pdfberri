// src/components/pages/tools/pdf-to-word/pdf-to-word-extract.ts

import type { PDFPageProxy } from "pdfjs-dist";
import { PDF_TO_WORD_LIMITS } from "./pdf-to-word-constants";
import type { PdfjsModule } from "./pdf-to-word-pdfjs";
import type { PageContent, PageImage, RawItem } from "./pdf-to-word-types";
import { cleanText, isRtlText } from "./pdf-to-word-utils";

type Matrix = [number, number, number, number, number, number];

/** Canvas-style multiplication: result = m1 x m2 */
function multiply(m1: Matrix, m2: Matrix): Matrix {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
}

// ------------------------------------------------------------
// Fonts
// ------------------------------------------------------------

interface FontInfo {
  name: string | null;
  family: string;
  bold: boolean;
  italic: boolean;
}

const BOLD_RE = /(bold|black|heavy|demi|semibold|extrabold)/i;
const ITALIC_RE = /(italic|oblique|slanted)/i;

function resolveFont(
  page: PDFPageProxy,
  fontName: string,
  styles: Record<string, { fontFamily?: string }>,
  cache: Map<string, FontInfo>,
): FontInfo {
  const cached = cache.get(fontName);
  if (cached) return cached;

  let name: string | null = null;
  let bold = false;
  let italic = false;

  try {
    if (page.commonObjs.has(fontName)) {
      const font = page.commonObjs.get(fontName) as {
        name?: string;
        bold?: boolean;
        italic?: boolean;
        black?: boolean;
      } | null;
      name = typeof font?.name === "string" ? font.name : null;
      bold = Boolean(font?.bold || font?.black);
      italic = Boolean(font?.italic);
    }
  } catch {
    name = null;
  }

  if (name) {
    bold = bold || BOLD_RE.test(name);
    italic = italic || ITALIC_RE.test(name);
  }

  const info: FontInfo = {
    name,
    family: styles[fontName]?.fontFamily ?? "sans-serif",
    bold,
    italic,
  };
  cache.set(fontName, info);
  return info;
}

// ------------------------------------------------------------
// Images
// ------------------------------------------------------------

interface ImageLike {
  width: number;
  height: number;
  data?: Uint8ClampedArray | Uint8Array;
  kind?: number;
  bitmap?: ImageBitmap;
}

function loadImageObject(
  page: PDFPageProxy,
  ref: unknown,
): Promise<ImageLike | null> {
  if (typeof ref !== "string") return Promise.resolve(ref as ImageLike);
  const store = ref.startsWith("g_") ? page.commonObjs : page.objs;
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 4000);
    try {
      store.get(ref, (obj: unknown) => {
        clearTimeout(timer);
        resolve((obj as ImageLike | null) ?? null);
      });
    } catch {
      clearTimeout(timer);
      resolve(null);
    }
  });
}

async function encodeImage(
  img: ImageLike,
): Promise<{ data: Uint8Array; kind: "png" | "jpg" } | null> {
  const { width, height } = img;
  if (!width || !height || width * height > 24_000_000) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  let jpeg = false;

  if (img.bitmap) {
    ctx.drawImage(img.bitmap, 0, 0);
  } else if (img.data && img.kind) {
    const rgba = new Uint8ClampedArray(width * height * 4);
    const src = img.data;
    if (img.kind === 3) {
      rgba.set(src.subarray(0, rgba.length));
    } else if (img.kind === 2) {
      jpeg = true;
      for (let i = 0, j = 0; i < width * height; i += 1, j += 4) {
        rgba[j] = src[i * 3];
        rgba[j + 1] = src[i * 3 + 1];
        rgba[j + 2] = src[i * 3 + 2];
        rgba[j + 3] = 255;
      }
    } else if (img.kind === 1) {
      const stride = Math.ceil(width / 8);
      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const bit = (src[y * stride + (x >> 3)] >> (7 - (x & 7))) & 1;
          const v = bit ? 255 : 0;
          const o = (y * width + x) * 4;
          rgba[o] = v;
          rgba[o + 1] = v;
          rgba[o + 2] = v;
          rgba[o + 3] = 255;
        }
      }
    } else {
      return null;
    }
    ctx.putImageData(new ImageData(rgba, width, height), 0, 0);
  } else {
    return null;
  }

  let target = canvas;
  const maxSide = 1600;
  if (Math.max(width, height) > maxSide) {
    const ratio = maxSide / Math.max(width, height);
    const small = document.createElement("canvas");
    small.width = Math.max(1, Math.round(width * ratio));
    small.height = Math.max(1, Math.round(height * ratio));
    const sctx = small.getContext("2d");
    if (!sctx) return null;
    sctx.drawImage(canvas, 0, 0, small.width, small.height);
    target = small;
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    target.toBlob(resolve, jpeg ? "image/jpeg" : "image/png", 0.85),
  );
  canvas.width = 0;
  canvas.height = 0;
  if (!blob) return null;
  return {
    data: new Uint8Array(await blob.arrayBuffer()),
    kind: jpeg ? "jpg" : "png",
  };
}

async function extractImages(
  pdfjs: PdfjsModule,
  page: PDFPageProxy,
  opList: { fnArray: number[]; argsArray: unknown[] | null },
  viewportTransform: Matrix,
  pageWidth: number,
  pageHeight: number,
): Promise<PageImage[]> {
  const OPS = pdfjs.OPS;
  const argsArray = (opList.argsArray ?? []) as unknown[][];
  const stack: Matrix[] = [];
  let ctm: Matrix = [1, 0, 0, 1, 0, 0];
  const found: Array<{ ref: unknown; matrix: Matrix }> = [];

  for (let i = 0; i < opList.fnArray.length; i += 1) {
    const fn = opList.fnArray[i];
    const args = argsArray[i];
    if (fn === OPS.save) {
      stack.push(ctm);
    } else if (fn === OPS.restore) {
      ctm = stack.pop() ?? ctm;
    } else if (fn === OPS.transform && Array.isArray(args)) {
      ctm = multiply(ctm, args as unknown as Matrix);
    } else if (fn === OPS.paintFormXObjectBegin) {
      stack.push(ctm);
      if (Array.isArray(args?.[0])) {
        ctm = multiply(ctm, args[0] as Matrix);
      }
    } else if (fn === OPS.paintFormXObjectEnd) {
      ctm = stack.pop() ?? ctm;
    } else if (
      (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject) &&
      Array.isArray(args)
    ) {
      found.push({ ref: args[0], matrix: ctm });
    }
  }

  const images: PageImage[] = [];
  const pageArea = pageWidth * pageHeight;

  for (const entry of found) {
    if (images.length >= 25) break;
    const m = multiply(viewportTransform, entry.matrix);
    const xs = [m[4], m[0] + m[4], m[2] + m[4], m[0] + m[2] + m[4]];
    const ys = [m[5], m[1] + m[5], m[3] + m[5], m[1] + m[3] + m[5]];
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    const width = Math.max(...xs) - x;
    const height = Math.max(...ys) - y;

    if (width < 12 || height < 12) continue;
    if ((width * height) / pageArea > 0.85) continue; // full-page scans/backgrounds

    try {
      const obj = await loadImageObject(page, entry.ref);
      if (!obj) continue;
      const encoded = await encodeImage(obj);
      if (!encoded) continue;
      images.push({ x, y, width, height, ...encoded });
    } catch {
      // A single unreadable image must never fail the whole conversion.
    }
  }

  return images;
}

// ------------------------------------------------------------
// Page extraction
// ------------------------------------------------------------

export async function extractPageContent(
  pdfjs: PdfjsModule,
  page: PDFPageProxy,
  pageNumber: number,
): Promise<PageContent> {
  const viewport = page.getViewport({ scale: 1 });
  const vt = viewport.transform as Matrix;

  const [textContent, opList] = await Promise.all([
    page.getTextContent(),
    page.getOperatorList(),
  ]);

  const fontCache = new Map<string, FontInfo>();
  const styles = textContent.styles as Record<string, { fontFamily?: string }>;
  const items: RawItem[] = [];
  let charCount = 0;

  for (const raw of textContent.items) {
    if (!("str" in raw)) continue;
    const text = cleanText(raw.str);
    if (!text.trim()) continue;

    const t = multiply(vt, raw.transform as Matrix);
    const size = Math.hypot(t[2], t[3]);
    if (!Number.isFinite(size) || size < 1) continue;

    const font = resolveFont(page, raw.fontName, styles, fontCache);
    items.push({
      text,
      x: t[4],
      xEnd: t[4] + Math.abs(raw.width),
      baseline: t[5],
      size: Math.round(size * 100) / 100,
      bold: font.bold,
      italic: font.italic,
      font: font.name ?? font.family,
      rtl: isRtlText(text),
    });
    charCount += text.replace(/\s/g, "").length;
  }

  let images: PageImage[] = [];
  try {
    images = await extractImages(
      pdfjs,
      page,
      opList as unknown as { fnArray: number[]; argsArray: unknown[] | null },
      vt,
      viewport.width,
      viewport.height,
    );
  } catch {
    images = [];
  }

  return {
    pageNumber,
    width: viewport.width,
    height: viewport.height,
    items,
    images,
    charCount,
    source:
      charCount >= PDF_TO_WORD_LIMITS.minTextCharsPerPage ? "text" : "none",
  };
}