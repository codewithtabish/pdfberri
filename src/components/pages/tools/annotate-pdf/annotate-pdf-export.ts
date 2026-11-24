// src/components/pages/tools/annotate-pdf/annotate-pdf-export.ts
import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";
import type { Annotation } from "./annotate-pdf-types";
import type { LoadedDoc } from "./annotate-pdf-engine";
import { safeFilename } from "./annotate-pdf-utils";

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  return rgb(
    ((n >> 16) & 255) / 255,
    ((n >> 8) & 255) / 255,
    (n & 255) / 255
  );
}

export async function exportAnnotatedPdf(
  loaded: LoadedDoc,
  annotations: Annotation[]
): Promise<{ blob: Blob; filename: string }> {
  const pdfDoc = await PDFDocument.load(loaded.bytes);
  const pages = pdfDoc.getPages();
  const font: PDFFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const byPage = new Map<number, Annotation[]>();
  for (const a of annotations) {
    const arr = byPage.get(a.pageIndex) ?? [];
    arr.push(a);
    byPage.set(a.pageIndex, arr);
  }

  for (const [pageIndex, list] of byPage) {
    const page = pages[pageIndex];
    if (!page) continue;
    const { width, height } = page.getSize();

    const nx = (v: number) => v * width;
    const ny = (v: number) => (1 - v) * height; // flip y (top-left -> bottom-left)

    for (const a of list) {
      if (a.kind === "highlight") {
        for (const r of a.regions) {
          page.drawRectangle({
            x: nx(r.x),
            y: ny(r.y + r.h),
            width: nx(r.w),
            height: r.h * height,
            color: hexToRgb(a.color),
            opacity: a.opacity,
            borderWidth: 0,
          });
        }
      } else if (a.kind === "underline" || a.kind === "strikethrough") {
        for (const s of a.segments) {
          page.drawLine({
            start: { x: nx(s.x1), y: ny(s.y1) },
            end: { x: nx(s.x2), y: ny(s.y2) },
            color: hexToRgb(a.color),
            thickness: a.thickness,
            opacity: a.opacity,
          });
        }
      } else if (a.kind === "freehand") {
        if (a.points.length > 1) {
          for (let i = 1; i < a.points.length; i++) {
            const p1 = a.points[i - 1];
            const p2 = a.points[i];
            page.drawLine({
              start: { x: nx(p1.x), y: ny(p1.y) },
              end: { x: nx(p2.x), y: ny(p2.y) },
              color: hexToRgb(a.color),
              thickness: a.width,
              opacity: a.opacity,
              lineCap: 1,
            });
          }
        }
      } else if (a.kind === "rect") {
        page.drawRectangle({
          x: nx(a.x),
          y: ny(a.y + a.h),
          width: nx(a.w),
          height: a.h * height,
          borderColor: hexToRgb(a.stroke),
          borderWidth: a.strokeWidth,
          color: a.fill ? hexToRgb(a.fill) : undefined,
          opacity: a.opacity,
          borderOpacity: a.opacity,
        });
      } else if (a.kind === "circle") {
        page.drawEllipse({
          x: nx(a.x + a.w / 2),
          y: ny(a.y + a.h / 2),
          xScale: (a.w * width) / 2,
          yScale: (a.h * height) / 2,
          borderColor: hexToRgb(a.stroke),
          borderWidth: a.strokeWidth,
          color: a.fill ? hexToRgb(a.fill) : undefined,
          opacity: a.opacity,
          borderOpacity: a.opacity,
        });
      } else if (a.kind === "arrow" || a.kind === "line") {
        page.drawLine({
          start: { x: nx(a.x1), y: ny(a.y1) },
          end: { x: nx(a.x2), y: ny(a.y2) },
          color: hexToRgb(a.color),
          thickness: a.strokeWidth,
          opacity: a.opacity,
        });
        if (a.kind === "arrow") {
          const angle = Math.atan2(ny(a.y2) - ny(a.y1), nx(a.x2) - nx(a.x1));
          const size = 10;
          const a1 = angle + Math.PI - 0.4;
          const a2 = angle + Math.PI + 0.4;
          const tip = { x: nx(a.x2), y: ny(a.y2) };
          page.drawLine({
            start: tip,
            end: { x: tip.x + Math.cos(a1) * size, y: tip.y + Math.sin(a1) * size },
            color: hexToRgb(a.color),
            thickness: a.strokeWidth,
            opacity: a.opacity,
          });
          page.drawLine({
            start: tip,
            end: { x: tip.x + Math.cos(a2) * size, y: tip.y + Math.sin(a2) * size },
            color: hexToRgb(a.color),
            thickness: a.strokeWidth,
            opacity: a.opacity,
          });
        }
      } else if (a.kind === "text") {
        const lines = a.text.split("\n");
        const fs = a.fontSize;
        const lineH = fs * 1.25;
        const boxW = Math.max(40, a.w * width);
        const boxH = lineH * lines.length + 6;
        const topY = ny(a.y); // top-left of the box in PDF space

        if (a.background && a.background !== "transparent") {
          page.drawRectangle({
            x: nx(a.x),
            y: topY - boxH,
            width: boxW,
            height: boxH,
            color: hexToRgb(a.background),
            opacity: 0.85,
          });
        }
        lines.forEach((line, i) => {
          // First baseline sits just below the top edge of the box.
          page.drawText(line, {
            x: nx(a.x) + 2,
            y: topY - fs - i * lineH,
            size: fs,
            font,
            color: hexToRgb(a.color),
          });
        });
      } else if (a.kind === "comment") {
        // Flattened marker + visible note text.
        const px = nx(a.x);
        const py = ny(a.y);
        page.drawRectangle({
          x: px,
          y: py - 14,
          width: 20,
          height: 14,
          color: hexToRgb(a.color),
          borderWidth: 0,
          opacity: 1,
        });
        const safeText = a.text.replace(/[^\x00-\x7F]/g, "?").slice(0, 200);
        page.drawText(safeText, {
          x: px + 26,
          y: py - 10,
          size: 8,
          font,
          color: rgb(0.1, 0.1, 0.1),
        });
      }
    }
  }

  // ---- Blob fix -----------------------------------------------------------
  // pdf-lib returns Uint8Array<ArrayBufferLike>. Blob's DOM typings (TS 5.7+)
  // require ArrayBufferView<ArrayBuffer>. Copying into a fresh ArrayBuffer
  // guarantees the correct backing type without unsafe casts.
  const raw = await pdfDoc.save();
  const buffer = new ArrayBuffer(raw.byteLength);
  new Uint8Array(buffer).set(raw);

  const blob = new Blob([buffer], { type: "application/pdf" });
  return { blob, filename: safeFilename(loaded.name) };
}