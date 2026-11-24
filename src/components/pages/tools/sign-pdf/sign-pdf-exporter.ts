import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { PlacedElement } from "./sign-pdf-types";
import { downloadBlob } from "./sign-pdf-utils";
import { normToPdf } from "./sign-pdf-coordinate-system";

export async function exportSignedPdf(bytes: ArrayBuffer, elements: PlacedElement[], filename: string) {
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPages();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  for (const el of elements) {
    const page = pages[el.pageIndex];
    if (!page) continue;
    const { width, height } = page.getSize();
    const pdfRect = normToPdf(el.x, el.y, el.w, el.h, width, height);

    if (el.type === "signature" && el.dataUrl) {
      const b64 = el.dataUrl.split(",")[1];
      const imgBytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const img = await doc.embedPng(imgBytes);
      page.drawImage(img, pdfRect);
    } else if (el.text) {
      page.drawText(el.text, {
        x: pdfRect.x,
        y: pdfRect.y + pdfRect.height - (el.fontSize || 12),
        size: el.fontSize || 12,
        font,
        color: rgb(0, 0, 0),
      });
    }
  }

  const savedBytes = await doc.save();
  const buffer = new ArrayBuffer(savedBytes.byteLength);
  new Uint8Array(buffer).set(savedBytes);
  const blob = new Blob([buffer], { type: "application/pdf" });
  downloadBlob(blob, filename.replace(/\.pdf$/i, "") + "-signed.pdf");
}