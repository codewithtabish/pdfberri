import type { MergeRange, ScalingMode, SheetModel } from './excel-to-pdf-types';

export type Measure = (text: string, bold: boolean, italic: boolean, size: number) => number;

export const CELL_PAD = 2;
const MAX_ROW_HEIGHT = 409.5;

export interface Geometry {
  sheet: SheetModel;
  rows: number[];
  cols: number[];
  colW: number[];
  rowH: number[];
  totalW: number;
  totalH: number;
  colPos: Map<number, number>;
  rowPos: Map<number, number>;
  mergeAt: Map<string, MergeRange>;
  covered: Set<string>;
}

export interface GeometryOptions {
  usePrintArea: boolean;
  includeHiddenRows: boolean;
  includeHiddenCols: boolean;
}

function breakWord(word: string, maxWidth: number, fit: (s: string) => number): string[] {
  const parts: string[] = [];
  let cur = '';
  for (const ch of word) {
    if (cur && fit(cur + ch) > maxWidth) {
      parts.push(cur);
      cur = ch;
    } else {
      cur += ch;
    }
  }
  if (cur) parts.push(cur);
  return parts;
}

export function wrapLines(
  text: string,
  maxWidth: number,
  bold: boolean,
  italic: boolean,
  size: number,
  measure: Measure
): string[] {
  const fit = (s: string) => measure(s, bold, italic, size);
  const out: string[] = [];

  for (const para of text.split(/\r?\n/)) {
    if (para === '') {
      out.push('');
      continue;
    }
    let line = '';
    for (const word of para.split(' ')) {
      const candidate = line ? `${line} ${word}` : word;
      if (fit(candidate) <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line) {
        out.push(line);
        line = '';
      }
      if (fit(word) <= maxWidth) {
        line = word;
      } else {
        const parts = breakWord(word, maxWidth, fit);
        line = parts.pop() ?? '';
        out.push(...parts);
      }
    }
    out.push(line);
  }
  return out;
}

export function spanWidth(geo: Pick<Geometry, 'colPos' | 'colW'>, m: MergeRange, startPos: number): number {
  let last = startPos;
  for (let c = m.left; c <= m.right; c++) {
    const p = geo.colPos.get(c);
    if (p !== undefined && p > last) last = p;
  }
  let w = 0;
  for (let p = startPos; p <= last; p++) w += geo.colW[p];
  return w;
}

export function spanHeight(geo: Pick<Geometry, 'rowPos' | 'rowH'>, m: MergeRange, startPos: number): number {
  let last = startPos;
  for (let r = m.top; r <= m.bottom; r++) {
    const p = geo.rowPos.get(r);
    if (p !== undefined && p > last) last = p;
  }
  let h = 0;
  for (let p = startPos; p <= last; p++) h += geo.rowH[p];
  return h;
}

export function buildGeometry(sheet: SheetModel, opts: GeometryOptions, measure: Measure): Geometry {
  let r0 = 0;
  let r1 = sheet.rowCount - 1;
  let c0 = 0;
  let c1 = sheet.colCount - 1;
  if (opts.usePrintArea && sheet.printArea) {
    r0 = Math.max(r0, sheet.printArea.top);
    r1 = Math.min(r1, sheet.printArea.bottom);
    c0 = Math.max(c0, sheet.printArea.left);
    c1 = Math.min(c1, sheet.printArea.right);
  }

  const cols: number[] = [];
  for (let c = c0; c <= c1; c++) if (opts.includeHiddenCols || !sheet.hiddenCols[c]) cols.push(c);
  const rows: number[] = [];
  for (let r = r0; r <= r1; r++) if (opts.includeHiddenRows || !sheet.hiddenRows[r]) rows.push(r);

  const colW = cols.map((c) => sheet.colWidths[c]);
  const colPos = new Map<number, number>();
  cols.forEach((c, p) => colPos.set(c, p));
  const rowPos = new Map<number, number>();
  rows.forEach((r, p) => rowPos.set(r, p));

  const mergeAt = new Map<string, MergeRange>();
  const covered = new Set<string>();
  for (const m of sheet.merges) {
    mergeAt.set(`${m.top},${m.left}`, m);
    for (let r = m.top; r <= m.bottom; r++) {
      for (let c = m.left; c <= m.right; c++) {
        if (r !== m.top || c !== m.left) covered.add(`${r},${c}`);
      }
    }
  }

  const geo: Geometry = {
    sheet,
    rows,
    cols,
    colW,
    rowH: [],
    totalW: colW.reduce((a, b) => a + b, 0),
    totalH: 0,
    colPos,
    rowPos,
    mergeAt,
    covered,
  };

  for (const r of rows) {
    const explicit = sheet.rowHeights[r];
    if (explicit !== null && explicit !== undefined) {
      geo.rowH.push(Math.min(Math.max(explicit, 1), MAX_ROW_HEIGHT));
      continue;
    }

    let h = sheet.defaultRowHeight;
    for (const [p, c] of cols.entries()) {
      const cell = sheet.cells[r][c];
      if (!cell || cell.text === '') continue;
      const fs = cell.style.fontSize;
      h = Math.max(h, fs * 1.25 + 3);

      if (cell.style.wrap) {
        const m = mergeAt.get(`${r},${c}`);
        if (m && m.bottom !== m.top) continue;
        const width = m ? spanWidth(geo, m, p) : colW[p];
        const lines = wrapLines(cell.text, width - 2 * CELL_PAD, cell.style.bold, cell.style.italic, fs, measure);
        h = Math.max(h, lines.length * fs * 1.2 + 4);
      }
    }
    geo.rowH.push(Math.min(h, MAX_ROW_HEIGHT));
  }

  geo.totalH = geo.rowH.reduce((a, b) => a + b, 0);
  return geo;
}

export interface PageSpec {
  colStart: number;
  colEnd: number;
  rowStart: number;
  rowEnd: number;
}

export interface PlanOptions {
  paperW: number;
  paperH: number;
  margin: { top: number; right: number; bottom: number; left: number };
  bandTop: number;
  bandBottom: number;
  orientation: 'auto' | 'portrait' | 'landscape';
  scaling: ScalingMode;
  repeatHeader: boolean;
}

export interface SheetPlan {
  orientation: 'portrait' | 'landscape';
  pageW: number;
  pageH: number;
  scale: number;
  pages: PageSpec[];
  repeatHeader: boolean;
  clippedColumns: boolean;
  contentX: number;
  contentTop: number;
  contentW: number;
  contentH: number;
}

function makeBands(sizes: number[], first: number, later: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  let start = 0;
  let sum = 0;
  for (let i = 0; i < sizes.length; i++) {
    const limit = out.length === 0 ? first : later;
    if (i > start && sum + sizes[i] > limit + 0.01) {
      out.push([start, i - 1]);
      start = i;
      sum = 0;
    }
    sum += sizes[i];
  }
  if (sizes.length > 0) out.push([start, sizes.length - 1]);
  return out;
}

function hasContent(geo: Geometry, p: PageSpec): boolean {
  for (let rp = p.rowStart; rp <= p.rowEnd; rp++) {
    const row = geo.sheet.cells[geo.rows[rp]];
    for (let cp = p.colStart; cp <= p.colEnd; cp++) {
      const cell = row[geo.cols[cp]];
      if (!cell) continue;
      const s = cell.style;
      if (cell.text !== '' || s.fill || s.top || s.right || s.bottom || s.left) return true;
    }
  }
  return false;
}

function build(geo: Geometry, o: PlanOptions, landscape: boolean): SheetPlan & { bandCount: number } {
  const pageW = landscape ? Math.max(o.paperW, o.paperH) : Math.min(o.paperW, o.paperH);
  const pageH = landscape ? Math.min(o.paperW, o.paperH) : Math.max(o.paperW, o.paperH);
  const contentW = pageW - o.margin.left - o.margin.right;
  const contentH = pageH - o.margin.top - o.margin.bottom - o.bandTop - o.bandBottom;

  let scale = 1;
  if (geo.totalW > 0 && geo.totalH > 0) {
    if (o.scaling === 'fit-width') scale = Math.min(1, contentW / geo.totalW);
    else if (o.scaling === 'fit-page') scale = Math.min(1, contentW / geo.totalW, contentH / geo.totalH);
  }

  const availW = contentW / scale;
  const availH = contentH / scale;
  const headerH = geo.rowH[0] ?? 0;
  const repeat = o.repeatHeader && geo.rows.length > 1 && headerH < availH / 2;

  const colBands = makeBands(geo.colW, availW, availW);
  const rowBands = makeBands(geo.rowH, availH, repeat ? availH - headerH : availH);

  const pages: PageSpec[] = [];
  for (const [colStart, colEnd] of colBands) {
    for (const [rowStart, rowEnd] of rowBands) {
      const spec: PageSpec = { colStart, colEnd, rowStart, rowEnd };
      if (hasContent(geo, spec)) pages.push(spec);
    }
  }

  return {
    orientation: landscape ? 'landscape' : 'portrait',
    pageW,
    pageH,
    scale,
    pages,
    repeatHeader: repeat,
    clippedColumns: geo.colW.some((w) => w > availW + 0.01),
    contentX: o.margin.left,
    contentTop: pageH - o.margin.top - o.bandTop,
    contentW,
    contentH,
    bandCount: colBands.length * rowBands.length,
  };
}

export function planSheet(
  geo: Geometry,
  o: PlanOptions,
  workbookOrientation: 'portrait' | 'landscape' | null
): SheetPlan {
  if (o.orientation === 'portrait') return build(geo, o, false);
  if (o.orientation === 'landscape') return build(geo, o, true);
  if (workbookOrientation) return build(geo, o, workbookOrientation === 'landscape');

  // Auto: choose from the real content size (fewer pages wins, then larger scale)
  const portrait = build(geo, o, false);
  const landscape = build(geo, o, true);
  if (landscape.bandCount < portrait.bandCount) return landscape;
  if (landscape.bandCount === portrait.bandCount && landscape.scale > portrait.scale * 1.05) return landscape;
  return portrait;
}