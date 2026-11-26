// src/components/pages/tools/pdf-to-excel/pdf-to-excel-export.ts
import ExcelJS from 'exceljs';
import { ExtractedTable } from './pdf-to-excel-types';

type CellValue = string | number;

const ARABIC_LETTER_RE = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g;
const LATIN_LETTER_RE = /[A-Za-z]/g;
const NUMBER_RE = /^[-+]?(\d{1,3}(,\d{3})+|\d+)(\.\d+)?$/;

function countLetters(text: string): { arabic: number; latin: number } {
  return {
    arabic: text.match(ARABIC_LETTER_RE)?.length ?? 0,
    latin: text.match(LATIN_LETTER_RE)?.length ?? 0,
  };
}

// A single cell is RTL only if Arabic-script letters outnumber Latin letters
function isRtlText(text: string): boolean {
  const { arabic, latin } = countLetters(text);
  return arabic > latin;
}

// Sheet direction is RTL only if the majority of all letters are Arabic-script
function tablesAreMostlyRtl(tables: ExtractedTable[]): boolean {
  let arabic = 0;
  let latin = 0;
  for (const t of tables) {
    for (const row of [t.headers, ...t.rows]) {
      for (const cell of row) {
        const c = countLetters(cell);
        arabic += c.arabic;
        latin += c.latin;
      }
    }
  }
  return arabic > latin;
}

function toCellValue(value: string, detect: boolean): CellValue {
  if (!detect) return value;
  const v = value.trim();
  if (!NUMBER_RE.test(v)) return value;
  const digits = v.replace(/[^0-9]/g, '');
  if (digits.length > 15) return value; // too long, would lose precision
  if (/^[-+]?0\d/.test(v)) return value; // keep leading zeros (codes, phone numbers)
  return Number(v.replace(/,/g, ''));
}

function safeSheetName(name: string): string {
  return name.replace(/[\[\]:*?/\\]/g, ' ').trim().substring(0, 31) || 'Sheet';
}

function alignRow(row: ExcelJS.Row, texts: string[], vertical: 'middle' | 'top') {
  texts.forEach((text, idx) => {
    row.getCell(idx + 1).alignment = {
      horizontal: isRtlText(text) ? 'right' : 'left',
      vertical,
      wrapText: true,
    };
  });
}

function writeTables(
  worksheet: ExcelJS.Worksheet,
  tables: ExtractedTable[],
  detectNumbers: boolean,
  showPageLabels: boolean
) {
  const colWidths: number[] = [];
  const track = (row: CellValue[]) => {
    row.forEach((v, idx) => {
      const len = Math.min(String(v).length, 80);
      colWidths[idx] = Math.max(colWidths[idx] ?? 10, len + 2);
    });
  };

  let lastPage = -1;
  let contentHeaderWritten = false;

  tables.forEach((table, idx) => {
    if (idx > 0) worksheet.addRow([]);

    if (showPageLabels && table.pageNumber !== lastPage) {
      const label = worksheet.addRow([`Page ${table.pageNumber}`]);
      label.font = { bold: true, italic: true };
      lastPage = table.pageNumber;
    }

    // Plain text blocks share one "Content" header per sheet
    const isTextBlock = table.headers.length === 1 && table.headers[0] === 'Content';
    if (!(isTextBlock && contentHeaderWritten)) {
      const headerRow = worksheet.addRow(table.headers);
      headerRow.font = { bold: true, size: 12 };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
      alignRow(headerRow, table.headers, 'middle');
      track(table.headers);
    }
    if (isTextBlock) contentHeaderWritten = true;

    for (const row of table.rows) {
      const values = row.map((c) => toCellValue(c, detectNumbers));
      const r = worksheet.addRow(values);
      alignRow(r, row, 'top');
      track(values);
    }
  });

  colWidths.forEach((w, idx) => {
    worksheet.getColumn(idx + 1).width = w;
  });

  worksheet.views = [{ rightToLeft: tablesAreMostlyRtl(tables) }];
}

export async function generateExcelWorkbook(
  tables: ExtractedTable[],
  settings: { sheets: 'per-page' | 'all-one'; numbers: 'text' | 'detect' }
): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'PDFBerri';

  const detectNumbers = settings.numbers === 'detect';

  if (settings.sheets === 'all-one') {
    const ws = workbook.addWorksheet('All Tables');
    writeTables(ws, tables, detectNumbers, true);
  } else {
    const byPage = new Map<number, ExtractedTable[]>();
    for (const t of tables) {
      const list = byPage.get(t.pageNumber) ?? [];
      list.push(t);
      byPage.set(t.pageNumber, list);
    }

    const used = new Set<string>();
    for (const [pageNumber, pageTables] of byPage) {
      let name = safeSheetName(`Page ${pageNumber}`);
      let n = 2;
      while (used.has(name.toLowerCase())) name = safeSheetName(`Page ${pageNumber} (${n++})`);
      used.add(name.toLowerCase());

      const ws = workbook.addWorksheet(name);
      writeTables(ws, pageTables, detectNumbers, false);
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}