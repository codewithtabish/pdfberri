import * as pdfjsLib from "pdfjs-dist";
import type { ExtractProgress, ExtractedImage, ExtractResult } from "./extract-types";
import { getSafeFileName } from "./extract-utils";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
}

interface PdfImageData {
  width: number;
  height: number;
  data?: Uint8Array | Uint8ClampedArray;
  kind?: number;
  bitmap?: ImageBitmap;
}

interface PdfObjStore {
  get: (id: string, callback?: (data: unknown) => void) => unknown;
}

const OPS = pdfjsLib.OPS as unknown as Record<string, number>;

const ID_IMAGE_OPS = new Set<number>(
  [OPS.paintImageXObject, OPS.paintImageXObjectRepeat, OPS.paintImageMaskXObject, OPS.paintJpegXObject].filter(
    (v): v is number => typeof v === "number"
  )
);
const INLINE_IMAGE_OP = OPS.paintInlineImageXObject;

function isImageLike(value: unknown): value is PdfImageData {
  if (!value || typeof value !== "object") return false;
  const v = value as PdfImageData;
  return (
    typeof v.width === "number" &&
    typeof v.height === "number" &&
    v.width > 0 &&
    v.height > 0 &&
    (!!v.data || !!v.bitmap)
  );
}

function getPdfObject(store: PdfObjStore, id: string): Promise<PdfImageData | null> {
  return new Promise((resolve) => {
    let done = false;
    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        resolve(null);
      }
    }, 8000);
    try {
      store.get(id, (data) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve(isImageLike(data) ? data : null);
      });
    } catch {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve(null);
      }
    }
  });
}

async function imageToPngBlob(img: PdfImageData): Promise<Blob | null> {
  const { width, height } = img;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  if (img.bitmap) {
    ctx.drawImage(img.bitmap, 0, 0, width, height);
  } else if (img.data) {
    const src = img.data;
    const out = ctx.createImageData(width, height);
    const px = width * height;

    if (src.length === px * 4) {
      out.data.set(src);
    } else if (src.length === px * 3) {
      for (let j = 0, k = 0; j < px; j++, k += 3) {
        out.data[j * 4] = src[k];
        out.data[j * 4 + 1] = src[k + 1];
        out.data[j * 4 + 2] = src[k + 2];
        out.data[j * 4 + 3] = 255;
      }
    } else if (src.length === px) {
      for (let j = 0; j < px; j++) {
        const v = src[j];
        out.data[j * 4] = v;
        out.data[j * 4 + 1] = v;
        out.data[j * 4 + 2] = v;
        out.data[j * 4 + 3] = 255;
      }
    } else {
      // 1 bit per pixel, packed rows
      const rowBytes = (width + 7) >> 3;
      if (src.length < rowBytes * height) return null;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const bit = (src[y * rowBytes + (x >> 3)] >> (7 - (x & 7))) & 1;
          const v = bit ? 255 : 0;
          const o = (y * width + x) * 4;
          out.data[o] = v;
          out.data[o + 1] = v;
          out.data[o + 2] = v;
          out.data[o + 3] = 255;
        }
      }
    }
    ctx.putImageData(out, 0, 0);
  } else {
    return null;
  }

  const blob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), "image/png"));
  canvas.width = 0;
  canvas.height = 0;
  return blob;
}

export async function extractImagesFromPdf(
  file: File,
  onProgress: (progress: ExtractProgress) => void,
  signal?: AbortSignal
): Promise<ExtractResult> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });

  const images: ExtractedImage[] = [];
  const byId = new Map<string, ExtractedImage>();
  const failedIds = new Set<string>();
  let skipped = 0;
  let totalPages = 0;

  try {
    const pdfDoc = await loadingTask.promise;
    totalPages = pdfDoc.numPages;

    for (let i = 1; i <= totalPages; i++) {
      if (signal?.aborted) throw new Error("Processing cancelled");

      onProgress({
        stage: "extracting",
        currentPage: i,
        totalPages,
        message: `Scanning page ${i} of ${totalPages}... (${images.length} images found)`,
        percent: Math.round((i / totalPages) * 100),
      });

      const page = await pdfDoc.getPage(i);
      const opList = await page.getOperatorList();

      let pageImageCount = 0;
      let inlineCount = 0;

      for (let n = 0; n < opList.fnArray.length; n++) {
        if (signal?.aborted) throw new Error("Processing cancelled");

        const fn = opList.fnArray[n];
        const args = opList.argsArray[n] as unknown[];

        let key: string | null = null;
        let imgData: PdfImageData | null = null;

        if (ID_IMAGE_OPS.has(fn) && typeof args?.[0] === "string") {
          const objId = args[0] as string;
          key = objId;

          const existing = byId.get(key);
          if (existing) {
            if (!existing.pages.includes(i)) existing.pages.push(i);
            continue;
          }
          if (failedIds.has(key)) continue;

          const store = (objId.startsWith("g_") ? page.commonObjs : page.objs) as unknown as PdfObjStore;
          imgData = await getPdfObject(store, objId);
        } else if (fn === INLINE_IMAGE_OP && isImageLike(args?.[0])) {
          inlineCount++;
          key = `inline_p${i}_${inlineCount}`;
          imgData = args[0] as PdfImageData;
        } else {
          continue;
        }

        let blob: Blob | null = null;
        try {
          blob = imgData ? await imageToPngBlob(imgData) : null;
        } catch {
          blob = null;
        }

        if (!imgData || !blob || blob.size === 0) {
          failedIds.add(key);
          skipped++;
          continue;
        }

        pageImageCount++;
        const extracted: ExtractedImage = {
          id: key,
          pageNumber: i,
          pages: [i],
          width: imgData.width,
          height: imgData.height,
          format: "png",
          size: blob.size,
          blob,
          url: URL.createObjectURL(blob),
          fileName: getSafeFileName(file.name, i, pageImageCount, "png"),
        };
        byId.set(key, extracted);
        images.push(extracted);
      }

      page.cleanup();
    }
  } catch (e) {
    images.forEach((img) => URL.revokeObjectURL(img.url));
    throw e;
  } finally {
    try {
      await loadingTask.destroy();
    } catch {
      // ignore cleanup errors
    }
  }

  onProgress({
    stage: "completed",
    currentPage: totalPages,
    totalPages,
    message: `Found ${images.length} images.`,
    percent: 100,
  });

  return { fileName: file.name, images, skipped };
}