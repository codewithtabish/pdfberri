import { readFile, stat, writeFile } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";
import { config } from "./config.js";
import { JobError } from "./errors.js";

export type PageSize = "original" | "a4" | "letter";
export type Orientation = "auto" | "portrait" | "landscape";

const PRESETS = { a4: [595.28, 841.89], letter: [612, 792] } as const; // points, portrait

export interface PdfInfo {
  pages: number;
  firstPage: { width: number; height: number };
}

/** Confirms the file is a real, parseable PDF within limits. */
export async function verifyPdf(filePath: string): Promise<PdfInfo> {
  const info = await stat(filePath);
  if (info.size === 0 || info.size > config.maxOutputBytes) throw new JobError("invalid-output");
  const bytes = await readFile(filePath);
  if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") throw new JobError("invalid-output");

  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(bytes, { updateMetadata: false });
  } catch {
    throw new JobError("invalid-output");
  }
  const pages = doc.getPageCount();
  if (pages < 1) throw new JobError("invalid-output");
  return { pages, firstPage: doc.getPage(0).getSize() };
}

function targetSize(pageSize: "a4" | "letter", orientation: Orientation, w: number, h: number): [number, number] {
  const [short, long] = PRESETS[pageSize];
  const landscape = orientation === "landscape" || (orientation === "auto" && w >= h);
  return landscape ? [long, short] : [short, long];
}

/** Builds the final PDF from the master PDF. `indexes` are 0-based and keep their order. */
export async function buildOutput(
  masterPath: string,
  outPath: string,
  indexes: number[],
  pageSize: PageSize,
  orientation: Orientation,
): Promise<void> {
  const masterBytes = await readFile(masterPath);
  const out = await PDFDocument.create();

  if (pageSize === "original") {
    const source = await PDFDocument.load(masterBytes, { updateMetadata: false });
    for (const page of await out.copyPages(source, indexes)) out.addPage(page);
  } else {
    // Vector content is embedded, not rasterized. Aspect ratio is preserved; the slide is centered.
    const embedded = await out.embedPdf(masterBytes, indexes);
    for (const slide of embedded) {
      const [pageW, pageH] = targetSize(pageSize, orientation, slide.width, slide.height);
      const scale = Math.min(pageW / slide.width, pageH / slide.height);
      const width = slide.width * scale;
      const height = slide.height * scale;
      out.addPage([pageW, pageH]).drawPage(slide, { x: (pageW - width) / 2, y: (pageH - height) / 2, width, height });
    }
  }
  await writeFile(outPath, await out.save({ useObjectStreams: true }), { mode: 0o600 });
}
