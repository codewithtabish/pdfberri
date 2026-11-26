import type { Cell, CellValue, Worksheet } from 'exceljs';
import { formatCellValue } from './excel-to-pdf-format';
import {
  ConversionError,
  type BorderSide,
  type CellKind,
  type CellModel,
  type CellStyle,
  type FileKind,
  type HAlign,
  type MergeRange,
  type ParsedWorkbook,
  type SheetInfo,
  type SheetModel,
  type VAlign,
} from './excel-to-pdf-types';
import { MAX_CELLS_PER_SHEET, MAX_FILE_MB, MAX_SHEETS } from './excel-to-pdf-config';
import { tick } from './excel-to-pdf-utils';

interface Stats {
  missingFormulaResults: number;
  formulas: number;
  images: number;
  themeColors: number;
}

interface LooseColor {
  argb?: string;
  theme?: number;
}

interface LooseBorder {
  style?: string;
  color?: LooseColor;
}

type Primitive = number | string | boolean | Date;
type Resolved = { value: Primitive } | { error: string } | null;

const PK = [0x50, 0x4b, 0x03, 0x04];
const OLE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];

const startsWith = (bytes: Uint8Array, sig: number[]) => sig.every((b, i) => bytes[i] === b);

function colorToHex(c: LooseColor | undefined, stats: Stats): string | null {
  if (!c) return null;
  if (c.argb && /^[0-9a-f]{6,8}$/i.test(c.argb)) return `#${c.argb.slice(-6)}`;
  if (c.theme !== undefined) stats.themeColors++;
  return null;
}

function side(b: LooseBorder | undefined, stats: Stats): BorderSide | null {
  if (!b?.style) return null;
  const width =
    b.style === 'thick' ? 1.5 : b.style === 'medium' || b.style === 'double' ? 1 : b.style === 'hair' ? 0.25 : 0.5;
  return { width, color: colorToHex(b.color, stats) ?? '#000000' };
}

function mapH(h: string | undefined): HAlign {
  if (h === 'left' || h === 'justify' || h === 'fill' || h === 'distributed') return 'left';
  if (h === 'center' || h === 'centerContinuous') return 'center';
  if (h === 'right') return 'right';
  return 'general';
}

function mapV(v: string | undefined): VAlign {
  if (v === 'top') return 'top';
  if (v === 'middle' || v === 'center') return 'middle';
  return 'bottom';
}

function buildStyle(cell: Cell, stats: Stats, cache: Map<string, CellStyle>): CellStyle {
  const font = cell.font;
  const al = cell.alignment;
  const fill = cell.fill;
  const b = cell.border;

  const style: CellStyle = {
    bold: !!font?.bold,
    italic: !!font?.italic,
    underline: !!font?.underline,
    fontSize: font?.size ?? 11,
    color: colorToHex(font?.color, stats),
    fill: fill && fill.type === 'pattern' && fill.pattern === 'solid' ? colorToHex(fill.fgColor, stats) : null,
    hAlign: mapH(al?.horizontal),
    vAlign: mapV(al?.vertical),
    wrap: !!al?.wrapText,
    top: side(b?.top, stats),
    right: side(b?.right, stats),
    bottom: side(b?.bottom, stats),
    left: side(b?.left, stats),
  };

  const key = JSON.stringify(style);
  const hit = cache.get(key);
  if (hit) return hit;
  cache.set(key, style);
  return style;
}

function resolveValue(v: CellValue, stats: Stats): Resolved {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return { value: v };
  if (typeof v !== 'object') return { value: v };
  if ('richText' in v) return { value: v.richText.map((r) => r.text).join('') };
  if ('hyperlink' in v) return { value: String(v.text ?? v.hyperlink) };
  if ('error' in v) return { error: v.error };
  if ('formula' in v || 'sharedFormula' in v) {
    stats.formulas++;
    const r = v.result;
    if (r === undefined || r === null) {
      stats.missingFormulaResults++;
      return null;
    }
    if (r instanceof Date || typeof r !== 'object') return { value: r };
    if ('error' in r) return { error: r.error };
    return null;
  }
  return null;
}

function colToIndex(letters: string): number {
  let n = 0;
  for (const ch of letters.toUpperCase()) n = n * 26 + ch.charCodeAt(0) - 64;
  return n - 1;
}

function parseRange(ref: string): MergeRange | null {
  const clean = ref.replace(/^.*!/, '').trim();
  const m = /^\$?([A-Za-z]+)\$?(\d+)(?::\$?([A-Za-z]+)\$?(\d+))?$/.exec(clean);
  if (!m) return null;
  const left = colToIndex(m[1]);
  const top = Number(m[2]) - 1;
  const right = m[3] ? colToIndex(m[3]) : left;
  const bottom = m[4] ? Number(m[4]) - 1 : top;
  return {
    top: Math.min(top, bottom),
    left: Math.min(left, right),
    bottom: Math.max(top, bottom),
    right: Math.max(left, right),
  };
}

function emptySheet(id: number, name: string, hidden: boolean, reason: string | null): SheetModel {
  return {
    id,
    name,
    hidden,
    skippedReason: reason,
    rowCount: 0,
    colCount: 0,
    cells: [],
    colWidths: [],
    rowHeights: [],
    hiddenRows: [],
    hiddenCols: [],
    merges: [],
    printArea: null,
    orientation: null,
    defaultRowHeight: 15,
  };
}

function readSheet(ws: Worksheet, id: number, stats: Stats, cache: Map<string, CellStyle>): SheetModel {
  const hidden = ws.state !== 'visible';
  const rowCount = ws.rowCount;
  const colCount = ws.columnCount;

  if (rowCount === 0 || colCount === 0) return emptySheet(id, ws.name, hidden, null);
  if (rowCount * colCount > MAX_CELLS_PER_SHEET) {
    return emptySheet(
      id,
      ws.name,
      hidden,
      `Too large (${rowCount.toLocaleString()} rows × ${colCount} columns)`
    );
  }

  const cells: (CellModel | null)[][] = Array.from({ length: rowCount }, () =>
    new Array<CellModel | null>(colCount).fill(null)
  );
  const rowHeights: (number | null)[] = new Array<number | null>(rowCount).fill(null);
  const hiddenRows: boolean[] = new Array<boolean>(rowCount).fill(false);

  ws.eachRow({ includeEmpty: true }, (row, rn) => {
    const r = rn - 1;
    if (r >= rowCount) return;
    rowHeights[r] = typeof row.height === 'number' ? row.height : null;
    hiddenRows[r] = !!row.hidden;

    row.eachCell({ includeEmpty: true }, (cell, cn) => {
      const c = cn - 1;
      if (c >= colCount) return;
      if (cell.isMerged && cell.master.address !== cell.address) return;

      const res = resolveValue(cell.value, stats);
      let text = '';
      let kind: CellKind = 'text';
      if (res && 'error' in res) {
        text = res.error;
        kind = 'error';
      } else if (res) {
        const f = formatCellValue(res.value, cell.numFmt);
        text = f.text;
        kind = f.kind;
      }

      const style = buildStyle(cell, stats, cache);
      const hasBorder = !!(style.top || style.right || style.bottom || style.left);
      if (text === '' && !style.fill && !hasBorder) return;
      cells[r][c] = { text, kind, style };
    });
  });

  const defaultColWidth = ws.properties.defaultColWidth ?? 8.43;
  const colWidths: number[] = [];
  const hiddenCols: boolean[] = [];
  for (let c = 1; c <= colCount; c++) {
    const col = ws.getColumn(c);
    const w = col.width ?? defaultColWidth;
    colWidths.push((w * 7 + 5) * 0.75);
    hiddenCols.push(!!col.hidden);
  }

  const merges: MergeRange[] = [];
  for (const ref of ws.model.merges ?? []) {
    const m = parseRange(ref);
    if (!m || m.top >= rowCount || m.left >= colCount) continue;
    merges.push({
      top: m.top,
      left: m.left,
      bottom: Math.min(m.bottom, rowCount - 1),
      right: Math.min(m.right, colCount - 1),
    });
  }

  let printArea: MergeRange | null = null;
  const pa = ws.pageSetup?.printArea;
  if (typeof pa === 'string' && pa.trim()) printArea = parseRange(pa.split(/&&|,/)[0]);

  const orient = ws.pageSetup?.orientation;
  stats.images += ws.getImages().length;

  return {
    id,
    name: ws.name,
    hidden,
    skippedReason: null,
    rowCount,
    colCount,
    cells,
    colWidths,
    rowHeights,
    hiddenRows,
    hiddenCols,
    merges,
    printArea,
    orientation: orient === 'landscape' || orient === 'portrait' ? orient : null,
    defaultRowHeight: ws.properties.defaultRowHeight || 15,
  };
}

function parseCsvText(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, '');
  const first = clean.split(/\r?\n/, 1)[0] ?? '';
  const delims = [',', ';', '\t'];
  const counts = delims.map((d) => first.split(d).length);
  const delim = delims[counts.indexOf(Math.max(...counts))];

  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delim) {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && clean[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function csvToSheet(fileName: string, text: string): SheetModel {
  const rows = parseCsvText(text);
  const colCount = rows.reduce((m, r) => Math.max(m, r.length), 0);
  const rowCount = rows.length;
  const name = (fileName.replace(/\.[^.]+$/, '').replace(/[\[\]:*?/\\]/g, ' ').trim() || 'Sheet1').slice(0, 31);

  if (rowCount === 0 || colCount === 0) return emptySheet(1, name, false, null);
  if (rowCount * colCount > MAX_CELLS_PER_SHEET) {
    return emptySheet(1, name, false, `Too large (${rowCount.toLocaleString()} rows × ${colCount} columns)`);
  }

  const style: CellStyle = {
    bold: false,
    italic: false,
    underline: false,
    fontSize: 10,
    color: null,
    fill: null,
    hAlign: 'general',
    vAlign: 'top',
    wrap: true,
    top: null,
    right: null,
    bottom: null,
    left: null,
  };

  const maxLen: number[] = new Array<number>(colCount).fill(4);
  const cells: (CellModel | null)[][] = rows.map((r) => {
    const line: (CellModel | null)[] = new Array<CellModel | null>(colCount).fill(null);
    r.forEach((v, c) => {
      if (v === '') return;
      line[c] = { text: v, kind: 'text', style };
      maxLen[c] = Math.max(maxLen[c], Math.min(v.length, 45));
    });
    return line;
  });

  return {
    id: 1,
    name,
    hidden: false,
    skippedReason: null,
    rowCount,
    colCount,
    cells,
    colWidths: maxLen.map((l) => Math.min(l * 5.6 + 8, 260)),
    rowHeights: new Array<number | null>(rowCount).fill(null),
    hiddenRows: new Array<boolean>(rowCount).fill(false),
    hiddenCols: new Array<boolean>(colCount).fill(false),
    merges: [],
    printArea: null,
    orientation: null,
    defaultRowHeight: 14,
  };
}

export function toSheetInfo(s: SheetModel): SheetInfo {
  return {
    id: s.id,
    name: s.name,
    hidden: s.hidden,
    rowCount: s.rowCount,
    colCount: s.colCount,
    hiddenRowCount: s.hiddenRows.filter(Boolean).length,
    hiddenColCount: s.hiddenCols.filter(Boolean).length,
    mergeCount: s.merges.length,
    hasPrintSettings: !!s.printArea || !!s.orientation,
    skippedReason: s.skippedReason,
  };
}

export async function parseWorkbookFile(file: File, signal: AbortSignal): Promise<ParsedWorkbook> {
  const lower = file.name.toLowerCase();
  const kind: FileKind | null = lower.endsWith('.xlsx') ? 'xlsx' : lower.endsWith('.csv') ? 'csv' : null;

  if (!kind) {
    throw new ConversionError(
      'This file type is not supported. Please upload an .xlsx or .csv file. Old .xls, .xlsm and .ods files are not supported yet.'
    );
  }
  if (file.size === 0) throw new ConversionError('The file is empty.');
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    throw new ConversionError(`This file is larger than ${MAX_FILE_MB} MB.`);
  }

  const buffer = await file.arrayBuffer();
  if (signal.aborted) throw new ConversionError('Cancelled');

  if (kind === 'csv') {
    const text = new TextDecoder('utf-8').decode(buffer);
    const sheet = csvToSheet(file.name, text);
    const warnings: string[] = [];
    if (sheet.skippedReason) warnings.push(`"${sheet.name}" is too large and was skipped.`);
    if (sheet.rowCount === 0 && !sheet.skippedReason) throw new ConversionError('The CSV file has no data.');
    return { fileName: file.name, kind, sheets: [sheet], warnings };
  }

  const head = new Uint8Array(buffer.slice(0, 8));
  if (startsWith(head, OLE)) {
    throw new ConversionError(
      'This workbook is password-protected (or is an old .xls file saved with the .xlsx name). Remove the password in Excel and try again.'
    );
  }
  if (!startsWith(head, PK)) {
    throw new ConversionError('This file is not a valid .xlsx workbook. It may be corrupted.');
  }

  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  try {
    // exceljs types ask for a Node Buffer, but it accepts an ArrayBuffer in the browser.
    await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);
  } catch {
    throw new ConversionError('The workbook could not be read. The file may be corrupted or use unsupported features.');
  }
  if (signal.aborted) throw new ConversionError('Cancelled');

  if (workbook.worksheets.length === 0) throw new ConversionError('This workbook has no worksheets.');
  if (workbook.worksheets.length > MAX_SHEETS) {
    throw new ConversionError(`This workbook has more than ${MAX_SHEETS} worksheets.`);
  }

  const stats: Stats = { missingFormulaResults: 0, formulas: 0, images: 0, themeColors: 0 };
  const cache = new Map<string, CellStyle>();
  const sheets: SheetModel[] = [];

  for (const [i, ws] of workbook.worksheets.entries()) {
    sheets.push(readSheet(ws, i + 1, stats, cache));
    await tick();
    if (signal.aborted) throw new ConversionError('Cancelled');
  }

  const warnings: string[] = [];
  for (const s of sheets) {
    if (s.skippedReason) warnings.push(`Sheet "${s.name}" was skipped: ${s.skippedReason}.`);
  }
  if (stats.formulas > 0) {
    warnings.push('Formula cells show the results stored in the file. They are not recalculated.');
  }
  if (stats.missingFormulaResults > 0) {
    warnings.push(
      `${stats.missingFormulaResults} formula cell(s) have no stored result and will appear blank. Open the workbook in Excel and save it again to store the results.`
    );
  }
  if (stats.images > 0) {
    warnings.push(`${stats.images} image(s) were found in the workbook. Images are not included in the PDF.`);
  }
  if (stats.themeColors > 0) {
    warnings.push('Some theme-based colors could not be resolved and use the default color.');
  }
  warnings.push('Charts, shapes and text boxes cannot be converted. If your workbook has them, they will not appear in the PDF.');

  return { fileName: file.name, kind, sheets, warnings };
}