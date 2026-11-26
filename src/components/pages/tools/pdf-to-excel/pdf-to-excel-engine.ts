// src/components/pages/tools/pdf-to-excel/pdf-to-excel-engine.ts
import type { Worker } from 'tesseract.js';
import { loadPdfDocument } from './pdf-to-excel-pdfjs';
import { extractTextWithCoordinates, assessText } from './pdf-to-excel-text-extractor';
import { createOcrWorker, extractTextViaOcr } from './pdf-to-excel-ocr';
import { detectTablesFromCells } from './pdf-to-excel-table-detector';
import { MAX_FILE_SIZE_MB, MAX_PAGES } from './pdf-to-excel-config';
import { ExtractedTable, ProcessingStage } from './pdf-to-excel-types';

export async function processPdfToExcel(
  file: File,
  onProgress: (stage: ProcessingStage, progress: number) => void
): Promise<{ tables: ExtractedTable[]; totalPages: number; isScanned: boolean }> {
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error(`This PDF is larger than ${MAX_FILE_SIZE_MB} MB.`);
  }

  onProgress('loading', 5);
  const pdf = await loadPdfDocument(file);
  const totalPages = pdf.numPages;
  const pagesToProcess = Math.min(totalPages, MAX_PAGES);

  const allTables: ExtractedTable[] = [];
  let isScanned = false;
  let worker: Worker | null = null;

  try {
    for (let i = 1; i <= pagesToProcess; i++) {
      const base = 10 + ((i - 1) / pagesToProcess) * 85;
      const step = 85 / pagesToProcess;

      onProgress('extracting', Math.round(base));
      const page = await pdf.getPage(i);

      try {
        const cells = await extractTextWithCoordinates(page);
        const quality = assessText(cells.map((c) => c.text).join(' '));

        let pageTables: ExtractedTable[];

        if (quality.ok) {
          onProgress('detecting', Math.round(base + step * 0.7));
          pageTables = detectTablesFromCells(cells, i, 'text-layer');
        } else {
          // Text layer is missing or unreadable (scanned page or broken font encoding)
          isScanned = true;
          if (!worker) worker = await createOcrWorker();

          const ocrCells = await extractTextViaOcr(page, worker);
          onProgress('detecting', Math.round(base + step * 0.9));
          pageTables = detectTablesFromCells(ocrCells, i, 'ocr');

          const ocrQuality = assessText(ocrCells.map((c) => c.text).join(' '));
          if (!ocrQuality.ok) {
            for (const t of pageTables) {
              t.confidence = 'low';
              t.warnings.push('OCR result looks unreliable. Please check this page carefully.');
            }
          }
        }

        allTables.push(...pageTables);
      } finally {
        page.cleanup();
      }
    }
  } finally {
    if (worker) await worker.terminate();
  }

  onProgress('review', 100);
  return { tables: allTables, totalPages, isScanned };
}