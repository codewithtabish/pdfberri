import type PptxGenJS from "pptxgenjs";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import type { TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api";
import {
  MAX_ESTIMATED_OUTPUT_BYTES,
  MAX_IMAGE_SIDE,
  MAX_SELECTED_PAGES,
  PPTX_MIME,
  QUALITY_DPI,
  STAGE_LABELS,
  VECTOR_OP_THRESHOLD,
} from "./pdf-to-powerpoint-constants";
import { ConverterError } from "./pdf-to-powerpoint-errors";
import {
  loadPdfjs,
  releaseCanvas,
  renderPageToCanvas,
  type PdfjsModule,
} from "./pdf-to-powerpoint-pdfjs";
import type {
  ConversionOutput,
  ConversionSettings,
  ImageElement,
  PageWarning,
  ProcessingStage,
  ProgressState,
  SlideElement,
  SlideModel,
  SlideSize,
  TextElement,
  TextRun,
} from "./pdf-to-powerpoint-types";
import {
  buildOutputFileName,
  computeFit,
  computeSlideSize,
  estimateImageSlidesBytes,
  limitCanvasFactor,
  type FitResult,
} from "./pdf-to-powerpoint-utils";

// ---------- shared types and math ----------

type Matrix = [number, number, number, number, number, number];
const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];

/** Same convention as pdf.js Util.transform: result applies m2 first, then m1. */
function mul(m1: Matrix, m2: Matrix): Matrix {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
}

function asMatrix(value: unknown): Matrix | null {
  if (!Array.isArray(value) || value.length < 6) return null;
  const [a, b, c, d, e, f] = value as unknown[];
  if (
    typeof a === "number" && typeof b === "number" && typeof c === "number" &&
    typeof d === "number" && typeof e === "number" && typeof f === "number"
  ) {
    return [a, b, c, d, e, f];
  }
  return null;
}

export interface BuildEnv {
  slide: SlideSize;
  settings: ConversionSettings;
  dpi: number;
  signal?: AbortSignal;
  pdfjs: PdfjsModule;
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new ConverterError("CANCELLED");
}

const ASCENT_RATIO = 0.92; // baseline offset from box top, in font sizes
const LINE_HEIGHT_RATIO = 1.2;

// ---------- slide size ----------

export async function resolveSlideSize(
  doc: PDFDocumentProxy,
  firstPageIndex: number,
  option: ConversionSettings["slideSize"],
): Promise<SlideSize> {
  const page = await doc.getPage(firstPageIndex + 1);
  try {
    const viewport = page.getViewport({ scale: 1 });
    return computeSlideSize(option, { width: viewport.width, height: viewport.height });
  } finally {
    page.cleanup();
  }
}

// ---------- background / colour sampling ----------

const toHex = (r: number, g: number, b: number) =>
  [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();

function sampleBackground(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext("2d");
  if (!ctx || canvas.width < 4 || canvas.height < 4) return "FFFFFF";
  const spots: Array<[number, number]> = [
    [1, 1],
    [canvas.width - 3, 1],
    [1, canvas.height - 3],
    [canvas.width - 3, canvas.height - 3],
  ];
  const colors = spots.map(([x, y]) => {
    const d = ctx.getImageData(x, y, 2, 2).data;
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < d.length; i += 4) {
      r += d[i] ?? 0;
      g += d[i + 1] ?? 0;
      b += d[i + 2] ?? 0;
    }
    const n = d.length / 4;
    return [r / n, g / n, b / n] as const;
  });
  const first = colors[0];
  if (!first) return "FFFFFF";
  const similar = colors.every(
    (c) => Math.abs(c[0] - first[0]) + Math.abs(c[1] - first[1]) + Math.abs(c[2] - first[2]) < 24,
  );
  return similar ? toHex(first[0], first[1], first[2]) : "FFFFFF";
}

function sampleTextColor(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  scale: number,
  bounds: { x0: number; y0: number; x1: number; y1: number },
): string {
  const x0 = Math.max(0, Math.floor(bounds.x0 * scale));
  const y0 = Math.max(0, Math.floor(bounds.y0 * scale));
  const x1 = Math.min(canvas.width, Math.ceil(bounds.x1 * scale));
  const y1 = Math.min(canvas.height, Math.ceil(bounds.y1 * scale));
  const w = x1 - x0;
  const h = y1 - y0;
  if (w < 1 || h < 1 || w * h > 60000) return "000000";

  const data = ctx.getImageData(x0, y0, w, h).data;
  const buckets = new Map<number, { count: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0, g = data[i + 1] ?? 0, b = data[i + 2] ?? 0;
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const entry = buckets.get(key);
    if (entry) entry.count += 1;
    else buckets.set(key, { count: 1, r, g, b });
  }
  let bg = { count: 0, r: 255, g: 255, b: 255 };
  for (const entry of buckets.values()) if (entry.count > bg.count) bg = entry;

  let best = 0, br = 0, bgc = 0, bb = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0, g = data[i + 1] ?? 0, b = data[i + 2] ?? 0;
    const dist = Math.abs(r - bg.r) + Math.abs(g - bg.g) + Math.abs(b - bg.b);
    if (dist > best) {
      best = dist; br = r; bgc = g; bb = b;
    }
  }
  return best >= 60 ? toHex(br, bgc, bb) : "000000";
}

// ---------- fonts ----------

function readLoadedFontName(page: PDFPageProxy, loadedName: string): string | null {
  try {
    if (!page.commonObjs.has(loadedName)) return null;
    const font: unknown = page.commonObjs.get(loadedName);
    if (typeof font === "object" && font !== null && "name" in font && typeof font.name === "string") {
      return font.name;
    }
  } catch {
    /* font not resolved */
  }
  return null;
}

function parseFont(name: string | null, generic: string) {
  const clean = (name ?? "").replace(/^[A-Z]{6}\+/, "");
  const bold = /bold|black|heavy|semibold|demi/i.test(clean);
  const italic = /italic|oblique/i.test(clean);
  let family = (clean.split(/[-,]/)[0] ?? "")
    .replace(/(PSMT|MT|PS)$/, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();
  if (!family) {
    family = /serif/i.test(generic) && !/sans/i.test(generic)
      ? "Times New Roman"
      : /mono/i.test(generic)
        ? "Courier New"
        : "Arial";
  }
  return { family, bold, italic };
}

const RTL_PATTERN = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;

// ---------- text extraction ----------

interface Run {
  text: string;
  x: number; // baseline origin in viewport points
  baseline: number;
  size: number;
  angle: number;
  width: number;
  fontFace: string;
  bold: boolean;
  italic: boolean;
  rtl: boolean;
  color: string;
}

function extractRuns(
  page: PDFPageProxy,
  viewportTransform: Matrix,
  items: ReadonlyArray<TextItem | TextMarkedContent>,
  styles: Record<string, { fontFamily: string }>,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  sampleScale: number,
): Run[] {
  const runs: Run[] = [];
  for (const item of items) {
    if (!("str" in item) || item.str.trim() === "") continue;
    const own = asMatrix(item.transform);
    if (!own) continue;
    const tx = mul(viewportTransform, own);
    const size = Math.hypot(tx[2], tx[3]);
    if (size < 1) continue;

    let angle = (Math.atan2(tx[1], tx[0]) * 180) / Math.PI;
    if (Math.abs(angle) < 1) angle = 0;
    const width = item.width * Math.hypot(viewportTransform[0], viewportTransform[1]);

    const font = parseFont(
      readLoadedFontName(page, item.fontName),
      styles[item.fontName]?.fontFamily ?? "sans-serif",
    );
    const rtl = item.dir === "rtl" || RTL_PATTERN.test(item.str);

    const rad = (angle * Math.PI) / 180;
    const ux = Math.cos(rad), uy = Math.sin(rad);
    const vx = Math.sin(rad), vy = -Math.cos(rad); // "up" for the text
    const corners = [
      [tx[4], tx[5]],
      [tx[4] + ux * width, tx[5] + uy * width],
      [tx[4] + vx * size * ASCENT_RATIO, tx[5] + vy * size * ASCENT_RATIO],
      [tx[4] + ux * width + vx * size * ASCENT_RATIO, tx[5] + uy * width + vy * size * ASCENT_RATIO],
      [tx[4] - vx * size * 0.25, tx[5] - vy * size * 0.25],
    ];
    const xs = corners.map((c) => c[0] ?? 0);
    const ys = corners.map((c) => c[1] ?? 0);
    const color = sampleTextColor(ctx, canvas, sampleScale, {
      x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys),
    });

    runs.push({
      text: item.str,
      x: tx[4],
      baseline: tx[5],
      size,
      angle,
      width,
      fontFace: font.family,
      bold: font.bold,
      italic: font.italic,
      rtl,
      color,
    });
  }
  return runs;
}

/** Merges runs on the same baseline into lines. Rotated runs stay separate. */
function groupIntoLines(runs: Run[]): Run[][] {
  const lines: Run[][] = [];
  for (const run of runs) {
    if (run.angle !== 0) {
      lines.push([run]);
      continue;
    }
    const line = lines[lines.length - 1];
    const prev = line?.[line.length - 1];
    if (
      line && prev && prev.angle === 0 &&
      Math.abs(prev.baseline - run.baseline) < 0.3 * run.size &&
      run.x >= prev.x + prev.width - 0.5 * run.size &&
      run.x - (prev.x + prev.width) < 3 * run.size
    ) {
      line.push(run);
    } else {
      lines.push([run]);
    }
  }
  return lines;
}

function lineToElement(line: Run[], fit: FitResult): TextElement | null {
  const first = line[0];
  const last = line[line.length - 1];
  if (!first || !last) return null;

  const rad = (first.angle * Math.PI) / 180;
  const ux = Math.cos(rad), uy = Math.sin(rad);
  const vx = Math.sin(rad), vy = -Math.cos(rad);

  const lineWidth = Math.hypot(last.x - first.x, last.baseline - first.baseline) + last.width;
  const maxSize = Math.max(...line.map((r) => r.size));
  const heightPt = maxSize * LINE_HEIGHT_RATIO;
  const lift = ASCENT_RATIO * maxSize - heightPt / 2;
  const cx = first.x + ux * (lineWidth / 2) + vx * lift;
  const cy = first.baseline + uy * (lineWidth / 2) + vy * lift;

  const w = lineWidth * fit.scale;
  const h = heightPt * fit.scale;
  const runs: TextRun[] = line.map((run, index) => {
    const prev = line[index - 1];
    const gap = prev ? run.x - (prev.x + prev.width) : 0;
    const needsSpace =
      prev !== undefined && gap > 0.2 * run.size && !prev.text.endsWith(" ") && !run.text.startsWith(" ");
    return {
      text: `${needsSpace ? " " : ""}${run.text}`,
      fontFace: run.fontFace,
      fontSize: Math.max(1, Math.round(run.size * fit.scale * 72 * 10) / 10),
      bold: run.bold,
      italic: run.italic,
      color: run.color,
    };
  });

  return {
    type: "text",
    box: { x: fit.x + cx * fit.scale - w / 2, y: fit.y + cy * fit.scale - h / 2, w, h },
    runs,
    rotate: ((first.angle % 360) + 360) % 360,
    rtl: line.some((r) => r.rtl),
  };
}

// ---------- graphics scan (images and vector detection) ----------

interface FoundImage {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PageGraphics {
  images: FoundImage[];
  vectorOps: number;
  unsupported: string[];
}

const UNSUPPORTED_IMAGE_OPS = [
  "paintInlineImageXObject",
  "paintInlineImageXObjectGroup",
  "paintImageMaskXObject",
  "paintImageMaskXObjectGroup",
  "paintImageXObjectRepeat",
  "paintImageMaskXObjectRepeat",
  "paintJpegXObject",
];

const PAINT_OPS = [
  "fill", "eoFill", "fillStroke", "eoFillStroke",
  "closeFillStroke", "closeEOFillStroke", "stroke", "closeStroke", "shadingFill",
];

function numbersFor(ops: Record<string, number>, names: string[]): Set<number> {
  const set = new Set<number>();
  for (const name of names) {
    const value = ops[name];
    if (typeof value === "number") set.add(value);
  }
  return set;
}

async function scanGraphics(
  page: PDFPageProxy,
  pdfjs: PdfjsModule,
  viewportTransform: Matrix,
): Promise<PageGraphics> {
  const OPS: Record<string, number> = pdfjs.OPS;
  const paintOps = numbersFor(OPS, PAINT_OPS);
  const imageMaskOps = numbersFor(OPS, UNSUPPORTED_IMAGE_OPS);
  const list = await page.getOperatorList();

  const graphics: PageGraphics = { images: [], vectorOps: 0, unsupported: [] };
  let ctm: Matrix = viewportTransform ?? IDENTITY;
  const stack: Matrix[] = [];

  for (let i = 0; i < list.fnArray.length; i += 1) {
    const fn = list.fnArray[i];
    const args: unknown = list.argsArray[i];
    if (fn === undefined) continue;

    if (fn === OPS.save) {
      stack.push(ctm);
    } else if (fn === OPS.restore) {
      const previous = stack.pop();
      if (previous) ctm = previous;
    } else if (fn === OPS.transform) {
      const m = asMatrix(args);
      if (m) ctm = mul(ctm, m);
    } else if (fn === OPS.paintFormXObjectBegin) {
      stack.push(ctm);
      const m = asMatrix(Array.isArray(args) ? args[0] : null);
      if (m) ctm = mul(ctm, m);
    } else if (fn === OPS.paintFormXObjectEnd) {
      const previous = stack.pop();
      if (previous) ctm = previous;
    } else if (fn === OPS.paintImageXObject) {
      const id = Array.isArray(args) && typeof args[0] === "string" ? args[0] : null;
      if (!id) continue;
      const axisAligned =
        Math.abs(ctm[1]) < 0.01 * Math.abs(ctm[0]) + 1e-6 &&
        Math.abs(ctm[2]) < 0.01 * Math.abs(ctm[3]) + 1e-6;
      if (!axisAligned || ctm[0] <= 0 || ctm[3] >= 0) {
        graphics.unsupported.push("a rotated, skewed or mirrored image");
        continue;
      }
      const w = ctm[0];
      const h = -ctm[3];
      if (w < 1 || h < 1) continue;
      graphics.images.push({ id, x: ctm[4], y: ctm[5] + ctm[3], w, h });
    } else if (imageMaskOps.has(fn)) {
      graphics.unsupported.push("an image mask or inline image");
    } else if (paintOps.has(fn)) {
      graphics.vectorOps += 1;
    } else if (
      fn === OPS.constructPath &&
      Array.isArray(args) &&
      typeof args[0] === "number" &&
      paintOps.has(args[0])
    ) {
      graphics.vectorOps += 1; // newer pdf.js embeds the paint op in constructPath
    }
  }
  return graphics;
}

function resolvePdfObject(page: PDFPageProxy, id: string): Promise<unknown> {
  const store = id.startsWith("g_") ? page.commonObjs : page.objs;
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("timeout")), 5000);
    try {
      store.get(id, (value: unknown) => {
        window.clearTimeout(timer);
        resolve(value);
      });
    } catch (error) {
      window.clearTimeout(timer);
      reject(error);
    }
  });
}

async function imageToDataUrl(page: PDFPageProxy, id: string): Promise<string | null> {
  let object: unknown;
  try {
    object = await resolvePdfObject(page, id);
  } catch {
    return null;
  }
  if (typeof object !== "object" || object === null) return null;
  const rec = object as Record<string, unknown>;
  const width = typeof rec.width === "number" ? rec.width : 0;
  const height = typeof rec.height === "number" ? rec.height : 0;
  if (!width || !height) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const bitmap = rec.bitmap;
  if (typeof ImageBitmap !== "undefined" && bitmap instanceof ImageBitmap) {
    ctx.drawImage(bitmap, 0, 0);
  } else {
    const data = rec.data;
    if (!(data instanceof Uint8ClampedArray || data instanceof Uint8Array)) {
      releaseCanvas(canvas);
      return null;
    }
    const out = new Uint8ClampedArray(width * height * 4);
    if (rec.kind === 3 && data.length >= width * height * 4) {
      for (let i = 0; i < out.length; i += 1) out[i] = data[i] ?? 0;
    } else if (rec.kind === 2 && data.length >= width * height * 3) {
      for (let p = 0, q = 0; p < width * height; p += 1, q += 3) {
        out[p * 4] = data[q] ?? 0;
        out[p * 4 + 1] = data[q + 1] ?? 0;
        out[p * 4 + 2] = data[q + 2] ?? 0;
        out[p * 4 + 3] = 255;
      }
    } else {
      releaseCanvas(canvas);
      return null;
    }
    ctx.putImageData(new ImageData(out, width, height), 0, 0);
  }

  let result: HTMLCanvasElement = canvas;
  const longest = Math.max(width, height);
  if (longest > MAX_IMAGE_SIDE) {
    const k = MAX_IMAGE_SIDE / longest;
    const small = document.createElement("canvas");
    small.width = Math.round(width * k);
    small.height = Math.round(height * k);
    small.getContext("2d")?.drawImage(canvas, 0, 0, small.width, small.height);
    releaseCanvas(canvas);
    result = small;
  }
  const url = result.toDataURL("image/png");
  releaseCanvas(result);
  return url;
}

// ---------- model builders ----------

async function buildImageModel(
  page: PDFPageProxy,
  pageIndex: number,
  env: BuildEnv,
): Promise<SlideModel> {
  const base = page.getViewport({ scale: 1 });
  const { slide, settings, dpi } = env;
  const cover = settings.fit === "cover" && settings.mode === "high-fidelity";
  const fit = computeFit(base.width, base.height, slide.width, slide.height, cover ? "cover" : "contain");

  const ppp = fit.scale * dpi; // pixels per PDF point
  const outW = cover ? slide.width * dpi : base.width * ppp;
  const outH = cover ? slide.height * dpi : base.height * ppp;
  const factor = limitCanvasFactor(outW, outH);
  const warnings: string[] = [];
  if (factor < 1) warnings.push("Resolution was reduced to stay within browser memory limits.");

  const canvas = await renderPageToCanvas(page, {
    scale: ppp * factor,
    offsetX: cover ? fit.x * dpi * factor : 0,
    offsetY: cover ? fit.y * dpi * factor : 0,
    width: outW * factor,
    height: outH * factor,
    signal: env.signal,
  });

  try {
    const png = settings.quality === "max";
    const dataUrl = png ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.92);
    const background = sampleBackground(canvas);
    const box = cover
      ? { x: 0, y: 0, w: slide.width, h: slide.height }
      : { x: fit.x, y: fit.y, w: fit.width, h: fit.height };
    return {
      pageIndex,
      size: slide,
      background,
      elements: [{ type: "image", box, dataUrl }],
      fidelity: "image",
      warnings,
    };
  } finally {
    releaseCanvas(canvas);
  }
}

async function buildEditableModel(
  page: PDFPageProxy,
  pageIndex: number,
  env: BuildEnv,
): Promise<SlideModel> {
  const viewport = page.getViewport({ scale: 1 });
  const vt = asMatrix(viewport.transform) ?? IDENTITY;
  const fit = computeFit(viewport.width, viewport.height, env.slide.width, env.slide.height, "contain");
  const sampleScale = 1.5;
  const raster = await renderPageToCanvas(page, { scale: sampleScale, signal: env.signal });

  let reason: string | null = null;
  const warnings: string[] = [];
  const elements: SlideElement[] = [];
  let background = "FFFFFF";

  try {
    const ctx = raster.getContext("2d");
    if (!ctx) throw new ConverterError("MEMORY");
    background = sampleBackground(raster);

    const [textContent, graphics] = await Promise.all([
      page.getTextContent(),
      scanGraphics(page, env.pdfjs, vt),
    ]);
    const runs = extractRuns(page, vt, textContent.items, textContent.styles, ctx, raster, sampleScale);
    const pageArea = viewport.width * viewport.height;
    const hasVector = graphics.vectorOps > VECTOR_OP_THRESHOLD;

    if (graphics.unsupported.length > 0) {
      reason = `Contains ${graphics.unsupported[0]}, which can't be rebuilt.`;
    } else if (runs.length === 0 && graphics.images.length === 0) {
      reason = "Has no extractable text or images (scanned or outlined content).";
    } else if (
      runs.length === 0 &&
      graphics.images.some((img) => (img.w * img.h) / pageArea > 0.85)
    ) {
      reason = "Is a scanned page image with no text layer.";
    } else if (hasVector && env.settings.vectorPolicy === "fallback") {
      reason = "Contains vector graphics, lines or table borders that can't be rebuilt as editable shapes.";
    }

    if (!reason) {
      for (const image of graphics.images) {
        throwIfAborted(env.signal);
        const dataUrl = await imageToDataUrl(page, image.id);
        if (!dataUrl) {
          reason = "Contains an image in a format that can't be extracted.";
          break;
        }
        const element: ImageElement = {
          type: "image",
          dataUrl,
          box: {
            x: fit.x + image.x * fit.scale,
            y: fit.y + image.y * fit.scale,
            w: image.w * fit.scale,
            h: image.h * fit.scale,
          },
        };
        elements.push(element);
      }
    }

    if (!reason) {
      for (const line of groupIntoLines(runs)) {
        const element = lineToElement(line, fit);
        if (element) elements.push(element);
      }
      if (hasVector) {
        warnings.push("Vector graphics, lines and table borders on this page are not included.");
      }
      if (runs.some((r) => r.rtl)) {
        warnings.push("Right-to-left text was positioned from the PDF. Check its direction in PowerPoint.");
      }
    }
  } finally {
    releaseCanvas(raster);
  }

  if (reason) {
    const fallback = await buildImageModel(page, pageIndex, env);
    fallback.warnings.unshift(`${reason} This slide is an image and is not editable.`);
    return fallback;
  }

  return { pageIndex, size: env.slide, background, elements, fidelity: "editable", warnings };
}

export async function buildSlideModel(
  page: PDFPageProxy,
  pageIndex: number,
  env: BuildEnv,
): Promise<SlideModel> {
  return env.settings.mode === "editable"
    ? buildEditableModel(page, pageIndex, env)
    : buildImageModel(page, pageIndex, env);
}

// ---------- PPTX building ----------

function addSlide(pptx: PptxGenJS, model: SlideModel, withNumber: boolean): void {
  const slide = pptx.addSlide();
  slide.background = { color: model.background };

  for (const element of model.elements) {
    if (element.type === "image") {
      slide.addImage({
        data: element.dataUrl.replace(/^data:/, ""),
        x: element.box.x,
        y: element.box.y,
        w: element.box.w,
        h: element.box.h,
      });
    } else {
      const runs: PptxGenJS.TextProps[] = element.runs.map((run) => ({
        text: run.text,
        options: {
          fontFace: run.fontFace,
          fontSize: run.fontSize,
          bold: run.bold,
          italic: run.italic,
          color: run.color,
        },
      }));
      slide.addText(runs, {
        x: element.box.x,
        y: element.box.y,
        w: element.box.w,
        h: element.box.h,
        margin: 0,
        valign: "top",
        align: element.rtl ? "right" : "left",
        wrap: false,
        fit: "none",
        rotate: element.rotate,
        rtlMode: element.rtl,
      });
    }
  }

  if (withNumber) {
    slide.slideNumber = {
      x: model.size.width - 0.9,
      y: model.size.height - 0.4,
      fontFace: "Arial",
      fontSize: 10,
      color: "666666",
    };
  }
}

async function validatePptx(blob: Blob, expectedSlides: number): Promise<void> {
  try {
    const { default: JSZip } = await import("jszip");
    const zip = await JSZip.loadAsync(blob);
    if (!zip.file("[Content_Types].xml") || !zip.file("ppt/presentation.xml")) {
      throw new ConverterError("INVALID_OUTPUT");
    }
    const slideCount = Object.keys(zip.files).filter((name) =>
      /^ppt\/slides\/slide\d+\.xml$/.test(name),
    ).length;
    if (slideCount !== expectedSlides) throw new ConverterError("INVALID_OUTPUT");
  } catch (error) {
    if (error instanceof ConverterError) throw error;
    throw new ConverterError("INVALID_OUTPUT");
  }
}

// ---------- public entry point ----------

export interface ConvertOptions {
  doc: PDFDocumentProxy;
  fileName: string;
  pageIndexes: number[];
  settings: ConversionSettings;
  signal: AbortSignal;
  onProgress: (progress: ProgressState) => void;
}

export async function convertPdfToPptx(options: ConvertOptions): Promise<ConversionOutput> {
  const { doc, pageIndexes, settings, signal, onProgress } = options;
  const first = pageIndexes[0];
  if (first === undefined) throw new ConverterError("NO_PAGES");
  if (pageIndexes.length > MAX_SELECTED_PAGES) throw new ConverterError("TOO_MANY_PAGES");

  const total = pageIndexes.length;
  const report = (stage: ProcessingStage, current: number, percent: number) =>
    onProgress({ stage, current, total, percent: Math.round(percent), message: STAGE_LABELS[stage] });

  report("loading", 0, 2);
  const pdfjs = await loadPdfjs();
  throwIfAborted(signal);

  const slide = await resolveSlideSize(doc, first, settings.slideSize);
  const dpi = QUALITY_DPI[settings.quality];

  if (
    settings.mode === "high-fidelity" &&
    estimateImageSlidesBytes(total, slide, dpi, settings.quality === "max") > MAX_ESTIMATED_OUTPUT_BYTES
  ) {
    throw new ConverterError("MEMORY");
  }

  const { default: PptxGen } = await import("pptxgenjs");
  const pptx = new PptxGen();
  pptx.defineLayout({ name: "PDFBERRI", width: slide.width, height: slide.height });
  pptx.layout = "PDFBERRI";
  pptx.company = "PDFBerri";

  const env: BuildEnv = { slide, settings, dpi, signal, pdfjs };
  const warnings: PageWarning[] = [];
  let editableSlides = 0;
  let imageSlides = 0;

  for (let i = 0; i < total; i += 1) {
    throwIfAborted(signal);
    const pageIndex = pageIndexes[i];
    if (pageIndex === undefined) continue;
    report("rendering", i, 5 + (i / total) * 80);

    const page = await doc.getPage(pageIndex + 1);
    try {
      const model = await buildSlideModel(page, pageIndex, env);
      addSlide(pptx, model, settings.addSlideNumbers);
      if (model.fidelity === "editable") editableSlides += 1;
      else imageSlides += 1;
      for (const message of model.warnings) warnings.push({ pageNumber: pageIndex + 1, message });
    } finally {
      page.cleanup();
    }
  }

  throwIfAborted(signal);
  report("building", total, 88);
  let blob: Blob;
  try {
    const output = await pptx.write({ outputType: "blob", compression: true });
    if (!(output instanceof Blob)) throw new Error("unexpected output");
    blob = new Blob([output], { type: PPTX_MIME });
  } catch {
    throw new ConverterError("BUILD_FAILED");
  }

  report("validating", total, 94);
  await validatePptx(blob, total);

  if (settings.mode === "editable" && editableSlides > 0) {
    warnings.push({
      pageNumber: null,
      message:
        "Font names come from the PDF. PowerPoint substitutes any font that isn't installed on the device opening the file.",
    });
  }

  report("preparing", total, 100);
  return {
    blob,
    summary: {
      fileName: buildOutputFileName(options.fileName),
      slideCount: total,
      sizeBytes: blob.size,
      mode: settings.mode,
      editableSlides,
      imageSlides,
      slideSize: slide,
      warnings,
    },
  };
}
