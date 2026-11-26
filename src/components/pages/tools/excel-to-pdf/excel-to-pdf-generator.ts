import type { PDFFont } from 'pdf-lib';
import { MARGIN_PT, MAX_PDF_PAGES, MM_TO_PT, PAPER_PT } from './excel-to-pdf-config';
import {
  buildGeometry,
  CELL_PAD,
  planSheet,
  spanHeight,
  spanWidth,
  wrapLines,
  type Geometry,
  type Measure,
  type PageSpec,
  type SheetPlan,
} from './excel-to-pdf-layout';
import { tick } from './excel-to-pdf-utils';
import {
  ConversionError,
  type BorderSide,
  type CellModel,
  type ConversionSettings,
  type ConvertProgress,
  type ConvertResult,
  type MergeRange,
  type ParsedWorkbook,
} from './excel-to-pdf-types';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function intersect(a: Rect, b: Rect): Rect | null {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);
  return x2 - x > 0.01 && y2 - y > 0.01 ? { x, y, w: x2 - x, h: y2 - y } : null;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
}

function getPaper(s: ConversionSettings): { w: number; h: number } {
  if (s.paper === 'custom') {
    if (!(s.customWidthMm >= 50 && s.customWidthMm <= 1000 && s.customHeightMm >= 50 && s.customHeightMm <= 1000)) {
      throw new ConversionError('Custom paper size must be between 50 and 1000 mm.');
    }
    return { w: s.customWidthMm * MM_TO_PT, h: s.customHeightMm * MM_TO_PT };
  }
  return PAPER_PT[s.paper];
}

function getMargin(s: ConversionSettings): number {
  if (s.margins === 'custom') {
    if (!(s.customMarginMm >= 0 && s.customMarginMm <= 100)) {
      throw new ConversionError('Custom margin must be between 0 and 100 mm.');
    }
    return s.customMarginMm * MM_TO_PT;
  }
  return MARGIN_PT[s.margins];
}

export async function generatePdf(
  wb: ParsedWorkbook,
  selectedIds: number[],
  settings: ConversionSettings,
  onProgress: (p: ConvertProgress) => void,
  signal: AbortSignal
): Promise<ConvertResult> {
  const check = () => {
    if (signal.aborted) throw new ConversionError('Cancelled');
  };

  const lib = await import('pdf-lib');
  const { PDFDocument, StandardFonts, rgb, pushGraphicsState, popGraphicsState, rectangle, clip, endPath } = lib;

  const sheets = wb.sheets.filter((s) => selectedIds.includes(s.id) && !s.skippedReason);
  if (sheets.length === 0) throw new ConversionError('Select at least one worksheet to convert.');

  const paper = getPaper(settings);
  const m = getMargin(settings);
  const margin = { top: m, right: m, bottom: m, left: m };
  const bandTop = settings.sheetNameHeader ? 14 : 0;
  const bandBottom = settings.pageNumbers ? 14 : 0;
  if (paper.w - 2 * m < 40 || paper.h - 2 * m - bandTop - bandBottom < 40) {
    throw new ConversionError('The margins are too large for this paper size.');
  }

  const doc = await PDFDocument.create();
  doc.setProducer('PDFBerri');
  doc.setCreator('PDFBerri');

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);
  const boldItalic = await doc.embedFont(StandardFonts.HelveticaBoldOblique);
  const supported = new Set<number>(regular.getCharacterSet());

  const pick = (b: boolean, i: boolean): PDFFont => (b && i ? boldItalic : b ? bold : i ? italic : regular);

  const toSafe = (text: string): { text: string; replaced: boolean } => {
    let out = '';
    let replaced = false;
    for (const ch of text.normalize('NFC')) {
      const cp = ch.codePointAt(0) ?? 63;
      if (cp === 9 || cp === 10 || cp === 13 || cp === 0xa0) out += ' ';
      else if (supported.has(cp)) out += ch;
      else {
        out += '?';
        replaced = true;
      }
    }
    return { text: out, replaced };
  };

  const measure: Measure = (text, b, i, size) => pick(b, i).widthOfTextAtSize(toSafe(text).text, size);

  const warnings: string[] = [];
  const replacedCells = new Set<CellModel>();

  interface Planned {
    geo: Geometry;
    plan: SheetPlan;
  }
  const planned: Planned[] = [];

  // Pass 1: layout every sheet
  for (const [i, sheet] of sheets.entries()) {
    check();
    onProgress({ message: `Measuring layout: ${sheet.name}`, percent: Math.round((i / sheets.length) * 40) });
    await tick();

    const geo = buildGeometry(
      sheet,
      {
        usePrintArea: settings.useWorkbookPrintSettings,
        includeHiddenRows: settings.includeHiddenRows,
        includeHiddenCols: settings.includeHiddenColumns,
      },
      measure
    );

    const plan = planSheet(
      geo,
      {
        paperW: paper.w,
        paperH: paper.h,
        margin,
        bandTop,
        bandBottom,
        orientation: settings.orientation,
        scaling: settings.scaling,
        repeatHeader: settings.repeatHeaderRow,
      },
      settings.useWorkbookPrintSettings && settings.orientation === 'auto' ? sheet.orientation : null
    );

    if (plan.pages.length > 0 && plan.scale < 0.5) {
      warnings.push(
        `"${sheet.name}" was scaled down to ${Math.round(plan.scale * 100)}% to fit. Text may be hard to read. Try landscape, a larger paper size or "Actual size".`
      );
    }
    if (plan.pages.length > 0 && plan.clippedColumns) {
      warnings.push(`"${sheet.name}" has a column wider than the page. That column will be cut off.`);
    }
    if (plan.pages.length === 0) {
      warnings.push(`"${sheet.name}" has no printable content and was left out.`);
    }
    planned.push({ geo, plan });
  }

  const totalPages = planned.reduce((n, p) => n + p.plan.pages.length, 0);
  if (totalPages === 0) throw new ConversionError('The selected worksheets have no printable content.');
  if (totalPages > MAX_PDF_PAGES) {
    throw new ConversionError(
      `This would create ${totalPages} pages. The limit is ${MAX_PDF_PAGES}. Select fewer worksheets or use a smaller scale.`
    );
  }

  const pageSheets: string[] = [];
  let pageNo = 0;

  const drawPage = (geo: Geometry, plan: SheetPlan, spec: PageSpec) => {
    const page = doc.addPage([plan.pageW, plan.pageH]);
    pageNo++;
    pageSheets.push(geo.sheet.name);

    const S = plan.scale;
    const left = plan.contentX;
    const top = plan.contentTop;

    const rowsToDraw: number[] = [];
    if (plan.repeatHeader && spec.rowStart > 0) rowsToDraw.push(0);
    for (let rp = spec.rowStart; rp <= spec.rowEnd; rp++) rowsToDraw.push(rp);

    const rowY: number[] = [];
    let accY = 0;
    for (const rp of rowsToDraw) {
      rowY.push(accY);
      accY += geo.rowH[rp];
    }
    const colX: number[] = [];
    let accX = 0;
    for (let cp = spec.colStart; cp <= spec.colEnd; cp++) {
      colX.push(accX);
      accX += geo.colW[cp];
    }
    const nCols = colX.length;

    const bandH = Math.min(accY * S, plan.contentH);
    const band: Rect = { x: left, y: top - bandH, w: Math.min(accX * S, plan.contentW), h: bandH };

    // Gridlines
    if (settings.showGridlines) {
      const gray = rgb(0.85, 0.85, 0.85);
      for (let i = 0; i <= rowsToDraw.length; i++) {
        const yy = top - (i < rowsToDraw.length ? rowY[i] : accY) * S;
        if (yy < band.y - 0.01) continue;
        page.drawLine({ start: { x: band.x, y: yy }, end: { x: band.x + band.w, y: yy }, thickness: 0.3, color: gray });
      }
      for (let i = 0; i <= nCols; i++) {
        const xx = left + (i < nCols ? colX[i] : accX) * S;
        if (xx > band.x + band.w + 0.01) continue;
        page.drawLine({ start: { x: xx, y: top }, end: { x: xx, y: band.y }, thickness: 0.3, color: gray });
      }
    }

    interface Item {
      cell: CellModel;
      merge: MergeRange | undefined;
      rect: Rect;
      r: number;
      cp: number;
      w: number;
    }
    const items: Item[] = [];

    rowsToDraw.forEach((rp, ri) => {
      const r = geo.rows[rp];
      for (let ci = 0; ci < nCols; ci++) {
        const cp = spec.colStart + ci;
        const c = geo.cols[cp];
        const key = `${r},${c}`;
        if (geo.covered.has(key)) continue;
        const cell = geo.sheet.cells[r][c];
        if (!cell) continue;

        const merge = geo.mergeAt.get(key);
        const w = merge ? spanWidth(geo, merge, cp) : geo.colW[cp];
        const h = merge ? spanHeight(geo, merge, rp) : geo.rowH[rp];
        const rect: Rect = { x: left + colX[ci] * S, y: top - (rowY[ri] + h) * S, w: w * S, h: h * S };
        items.push({ cell, merge, rect, r, cp, w });
      }
    });

    // 1) fills
    for (const it of items) {
      const vis = intersect(it.rect, band);
      if (!vis) continue;
      if (it.cell.style.fill) {
        const [r, g, b] = hexToRgb(it.cell.style.fill);
        page.drawRectangle({ x: vis.x, y: vis.y, width: vis.w, height: vis.h, color: rgb(r, g, b) });
      } else if (it.merge && settings.showGridlines) {
        page.drawRectangle({ x: vis.x, y: vis.y, width: vis.w, height: vis.h, color: rgb(1, 1, 1) });
      }
    }

    // 2) borders
    const hLine = (s: BorderSide, x1: number, x2: number, y: number) => {
      if (y < band.y - 0.01 || y > band.y + band.h + 0.01) return;
      const a = Math.max(x1, band.x);
      const b = Math.min(x2, band.x + band.w);
      if (b <= a) return;
      const [r, g, bl] = hexToRgb(s.color);
      page.drawLine({ start: { x: a, y }, end: { x: b, y }, thickness: Math.max(0.2, s.width * S), color: rgb(r, g, bl) });
    };
    const vLine = (s: BorderSide, x: number, y1: number, y2: number) => {
      if (x < band.x - 0.01 || x > band.x + band.w + 0.01) return;
      const a = Math.max(y1, band.y);
      const b = Math.min(y2, band.y + band.h);
      if (b <= a) return;
      const [r, g, bl] = hexToRgb(s.color);
      page.drawLine({ start: { x, y: a }, end: { x, y: b }, thickness: Math.max(0.2, s.width * S), color: rgb(r, g, bl) });
    };
    for (const it of items) {
      const { rect, cell } = it;
      const st = cell.style;
      if (st.top) hLine(st.top, rect.x, rect.x + rect.w, rect.y + rect.h);
      if (st.bottom) hLine(st.bottom, rect.x, rect.x + rect.w, rect.y);
      if (st.left) vLine(st.left, rect.x, rect.y, rect.y + rect.h);
      if (st.right) vLine(st.right, rect.x + rect.w, rect.y, rect.y + rect.h);
    }

    // 3) text
    for (const it of items) {
      const { cell, merge, rect, r, cp, w } = it;
      if (cell.text === '') continue;
      const st = cell.style;
      const font = pick(st.bold, st.italic);
      const fs = st.fontSize * S;
      if (fs < 0.5) continue;

      const align =
        st.hAlign !== 'general' ? st.hAlign : cell.kind === 'number' ? 'right' : cell.kind === 'text' ? 'left' : 'center';

      const lines = st.wrap
        ? wrapLines(cell.text, w - 2 * CELL_PAD, st.bold, st.italic, st.fontSize, measure)
        : [cell.text.replace(/\s*\r?\n\s*/g, ' ')];

      // Let left-aligned single-line text flow into empty cells on the right
      let extra = 0;
      if (!st.wrap && !merge && align === 'left') {
        const need = measure(lines[0], st.bold, st.italic, st.fontSize) + 2 * CELL_PAD;
        let p = cp + 1;
        while (need > w + extra && p <= spec.colEnd) {
          const c2 = geo.cols[p];
          const next = geo.sheet.cells[r][c2];
          const blocked = geo.covered.has(`${r},${c2}`) || geo.mergeAt.has(`${r},${c2}`);
          if (blocked || (next && (next.text !== '' || next.style.fill))) break;
          extra += geo.colW[p];
          p++;
        }
      }

      const textClip = intersect({ x: rect.x, y: rect.y, w: rect.w + extra * S, h: rect.h }, band);
      if (!textClip) continue;

      const lineH = st.fontSize * 1.2 * S;
      const block = lines.length * lineH;
      const free = rect.h - block;
      const offset =
        st.vAlign === 'top'
          ? Math.min(1 * S, Math.max(free, 0))
          : st.vAlign === 'middle'
            ? Math.max(free / 2, 0)
            : Math.max(free - 1 * S, 0);
      const [cr, cg, cb] = st.color ? hexToRgb(st.color) : [0, 0, 0];

      page.pushOperators(pushGraphicsState(), rectangle(textClip.x, textClip.y, textClip.w, textClip.h), clip(), endPath());

      lines.forEach((line, li) => {
        if (line === '') return;
        const safe = toSafe(line);
        if (safe.replaced) replacedCells.add(cell);
        const tw = font.widthOfTextAtSize(safe.text, fs);
        const pad = CELL_PAD * S;
        const x =
          align === 'right' ? rect.x + rect.w - pad - tw : align === 'center' ? rect.x + (rect.w - tw) / 2 : rect.x + pad;
        const lineTop = rect.y + rect.h - offset - li * lineH;
        const baseline = lineTop - (lineH - fs) / 2 - fs * 0.74;

        page.drawText(safe.text, { x, y: baseline, size: fs, font, color: rgb(cr, cg, cb) });
        if (st.underline) {
          page.drawLine({
            start: { x, y: baseline - fs * 0.12 },
            end: { x: x + tw, y: baseline - fs * 0.12 },
            thickness: Math.max(0.3, fs * 0.06),
            color: rgb(cr, cg, cb),
          });
        }
      });

      page.pushOperators(popGraphicsState());
    }

    // Header and footer
    if (settings.sheetNameHeader) {
      let name = toSafe(geo.sheet.name).text;
      while (name.length > 1 && regular.widthOfTextAtSize(name, 8) > plan.contentW) name = name.slice(0, -1);
      page.drawText(name, {
        x: margin.left,
        y: plan.pageH - margin.top - 9,
        size: 8,
        font: regular,
        color: rgb(0.4, 0.4, 0.4),
      });
    }
    if (settings.pageNumbers) {
      const label = `Page ${pageNo} of ${totalPages}`;
      const tw = regular.widthOfTextAtSize(label, 8);
      page.drawText(label, {
        x: (plan.pageW - tw) / 2,
        y: margin.bottom + 3,
        size: 8,
        font: regular,
        color: rgb(0.4, 0.4, 0.4),
      });
    }
  };

  // Pass 2: draw pages
  for (const { geo, plan } of planned) {
    for (const spec of plan.pages) {
      check();
      drawPage(geo, plan, spec);
      onProgress({
        message: `Creating page ${pageNo} of ${totalPages}`,
        percent: 40 + Math.round((pageNo / totalPages) * 55),
      });
      if (pageNo % 10 === 0) await tick();
    }
  }

  if (replacedCells.size > 0) {
    warnings.push(
      `${replacedCells.size} cell(s) contain characters the built-in PDF font cannot show (for example Arabic, Urdu, Chinese or emoji). They appear as "?" in the PDF.`
    );
  }

  onProgress({ message: 'Saving and checking the PDF', percent: 96 });
  check();
  const saved = await doc.save();

  const bytes = new Uint8Array(saved.length);
  bytes.set(saved);

  const header = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  if (header !== '%PDF') throw new ConversionError('The generated file is not a valid PDF.');
  const verify = await PDFDocument.load(bytes);
  if (verify.getPageCount() !== totalPages) {
    throw new ConversionError('The generated PDF has an unexpected number of pages.');
  }

  onProgress({ message: 'Done', percent: 100 });
  return {
    blob: new Blob([bytes], { type: 'application/pdf' }),
    pageCount: totalPages,
    pageSheets,
    warnings,
  };
}