// src/components/pages/tools/edit-pdf/edit-pdf-export.ts
import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont } from 'pdf-lib';
import type {
  DocumentModel,
  TextObject,
  ImageObject,
  AnnotationObject,
  SignatureObject,
  CommentObject,
} from './edit-pdf-types';
import { isSafeUrl } from './edit-pdf-utils';

export async function exportPDF(doc: DocumentModel): Promise<Uint8Array> {
  const src = await PDFDocument.load(doc.sourceBytes, { ignoreEncryption: false });
  const out = await PDFDocument.create();
  const orderedIndexes = doc.pages.map((p) => p.originalIndex);
  const copied = await out.copyPages(src, orderedIndexes);
  copied.forEach((p) => out.addPage(p));
  const pages = out.getPages();

  // Cache fonts
  const fontCache = new Map<string, PDFFont>();
  const getFont = async (family: string, bold: boolean, italic: boolean) => {
    const key = `${family}-${bold}-${italic}`;
    if (fontCache.has(key)) return fontCache.get(key)!;
    let std = StandardFonts.Helvetica;
    if (bold && italic) std = StandardFonts.HelveticaBoldOblique;
    else if (bold) std = StandardFonts.HelveticaBold;
    else if (italic) std = StandardFonts.HelveticaOblique;
    const font = await out.embedFont(std);
    fontCache.set(key, font);
    return font;
  };

  for (let i = 0; i < doc.pages.length; i++) {
    const pageState = doc.pages[i];
    const page = pages[i];

    if (pageState.rotation !== 0) {
      page.setRotation(degrees((page.getRotation().angle + pageState.rotation) % 360));
    }

    for (const obj of pageState.objects) {
      switch (obj.type) {
        case 'text':
          await drawText(out, page, obj as TextObject, getFont);
          break;
        case 'image':
          await drawImage(out, page, obj as ImageObject);
          break;
        case 'annotation':
          drawAnnotation(page, obj as AnnotationObject);
          break;
        case 'signature':
          await drawImage(out, page, obj as unknown as ImageObject & { src: string });
          break;
        case 'comment':
          drawComment(page, obj as CommentObject, await out.embedFont(StandardFonts.Helvetica));
          break;
        case 'link': {
          const lo = obj as { url: string; x: number; y: number; width: number; height: number };
          if (isSafeUrl(lo.url)) {
            // pdf-lib has no public API for link annotations; skip silently.
            // Document this in UI (see FAQ).
          }
          break;
        }
        case 'redaction':
          // Intentionally not exported. Blocked at the tool level.
          break;
      }
    }
  }

  return await out.save();
}

async function drawText(
  doc: PDFDocument,
  page: any,
  obj: TextObject,
  getFont: (family: string, bold: boolean, italic: boolean) => Promise<PDFFont>,
) {
  const font = await getFont(obj.fontFamily, obj.bold, obj.italic);
  page.drawText(obj.text, {
    x: obj.x,
    y: obj.y - obj.fontSize,
    size: obj.fontSize,
    font,
    color: hex(obj.color),
    opacity: obj.opacity,
    rotate: degrees(obj.rotation),
  });
}

async function drawImage(doc: PDFDocument, page: any, obj: ImageObject) {
  const bytes = dataUrlToBytes(obj.src);
  const img = obj.mime === 'image/png' || obj.src.startsWith('data:image/png')
    ? await doc.embedPng(bytes)
    : await doc.embedJpg(bytes);
  page.drawImage(img, {
    x: obj.x,
    y: obj.y - obj.height,
    width: obj.width,
    height: obj.height,
    opacity: obj.opacity,
    rotate: degrees(obj.rotation),
  });
}

function drawAnnotation(page: any, obj: AnnotationObject) {
  const c = hex(obj.color);
  const y = obj.y - obj.height;
  const lw = obj.lineWidth;
  switch (obj.shape) {
    case 'rectangle':
    case 'whiteout':
      page.drawRectangle({
        x: obj.x, y, width: obj.width, height: obj.height,
        borderColor: obj.shape === 'whiteout' ? rgb(1, 1, 1) : c,
        borderWidth: obj.shape === 'whiteout' ? 0 : lw,
        color: obj.shape === 'whiteout' ? rgb(1, 1, 1) : undefined,
        opacity: obj.opacity,
      });
      break;
    case 'circle':
      page.drawEllipse({
        x: obj.x + obj.width / 2, y: y + obj.height / 2,
        xScale: obj.width / 2, yScale: obj.height / 2,
        borderColor: c, borderWidth: lw, opacity: obj.opacity,
      });
      break;
    case 'highlight':
    case 'underline':
    case 'strikethrough': {
      const yy = obj.shape === 'underline' ? y
        : obj.shape === 'strikethrough' ? y + obj.height / 2
        : y;
      const h = obj.shape === 'highlight' ? obj.height : lw;
      page.drawRectangle({ x: obj.x, y: yy, width: obj.width, height: h, color: c, opacity: obj.opacity });
      break;
    }
    case 'line':
    case 'arrow': {
      page.drawLine({
        start: { x: obj.x, y: obj.y },
        end: { x: obj.x + obj.width, y: obj.y - obj.height },
        thickness: lw, color: c, opacity: obj.opacity,
      });
      break;
    }
    case 'draw': {
      if (!obj.points || obj.points.length < 2) break;
      for (let i = 1; i < obj.points.length; i++) {
        page.drawLine({
          start: obj.points[i - 1],
          end: obj.points[i],
          thickness: lw, color: c, opacity: obj.opacity,
        });
      }
      break;
    }
  }
}

function drawComment(page: any, obj: CommentObject, font: PDFFont) {
  page.drawRectangle({
    x: obj.x, y: obj.y - obj.height,
    width: obj.width, height: obj.height,
    color: hex(obj.color),
    opacity: 0.9,
  });
  page.drawText('!', {
    x: obj.x + obj.width / 2 - 3,
    y: obj.y - obj.height + 4,
    size: 14, font, color: rgb(1, 1, 1),
  });
}

function hex(hexStr: string) {
  const h = hexStr.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return rgb(r, g, b);
}

function dataUrlToBytes(url: string): Uint8Array {
  const base64 = url.split(',')[1] ?? url;
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}