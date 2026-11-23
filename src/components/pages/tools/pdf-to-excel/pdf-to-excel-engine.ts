// src/components/pages/tools/pdf-to-excel/pdf-to-excel-engine.ts
import { loadPdfDocument } from './pdf-to-excel-pdfjs';
import { extractTextWithCoordinates } from './pdf-to-excel-text-extractor';
import { extractTextViaOcr } from './pdf-to-excel-ocr';
import { detectTablesFromCells } from './pdf-to-excel-table-detector';
import { ExtractedTable, ProcessingStage } from './pdf-to-excel-types';

export async function processPdfToExcel(
  file: File,
  onProgress: (stage: ProcessingStage, progress: number) => void
): Promise<{ tables: ExtractedTable[]; totalPages: number; isScanned: boolean }> {
  
  onProgress('loading', 10);
  const pdf = await loadPdfDocument(file);
  const totalPages = pdf.numPages;

  const allTables: ExtractedTable[] = [];
  let isScanned = false;

  // Process only the first 3 pages for OCR demo purposes to save time
  const pagesToProcess = Math.min(totalPages, 3); 

  for (let i = 1; i <= pagesToProcess; i++) {
    onProgress('extracting', 10 + Math.floor((i / pagesToProcess) * 40));
    const page = await pdf.getPage(i);
    
    // Try text extraction first
    const cells = await extractTextWithCoordinates(page);
    
    // Check for broken text (gibberish usually has low ratio of standard chars)
    const combinedText = cells.map(c => c.text).join('');
    const isBroken = combinedText.includes('ẓ') || combinedText.includes('ṫ') || cells.length < 5;

    onProgress('detecting', 50 + Math.floor((i / pagesToProcess) * 40));

    if (isBroken) {
      isScanned = true;
      // Fallback to OCR
      const ocrCells = await extractTextViaOcr(page);
      const pageTables = detectTablesFromCells(ocrCells, i);
      allTables.push(...pageTables);
    } else {
      const pageTables = detectTablesFromCells(cells, i);
      allTables.push(...pageTables);
    }
    
    page.cleanup();
  }

  onProgress('review', 100);
  return { tables: allTables, totalPages, isScanned };
}