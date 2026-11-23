// src/components/pages/tools/pdf-to-excel/pdf-to-excel-table-detector.ts
import { ExtractedCell, ExtractedTable } from './pdf-to-excel-types';

export function detectTablesFromCells(cells: ExtractedCell[], pageNumber: number): ExtractedTable[] {
  if (cells.length === 0) return [];

  const mergedRows: string[] = [];
  let currentParagraph = "";

  for (let i = 0; i < cells.length; i++) {
    const line = cells[i].text.trim();
    
    if (!line) continue;

    // 1. Check for Code Blocks, Headings, and Bullets
    // If it looks like code (has brackets, math symbols, or is indented), keep it on its own line.
    const isCode = /[{}[\]=<>]|^\s{4,}/.test(line);
    
    // If it's a heading (starts with # or is very short and bold), keep it on its own line.
    const isHeading = /^#|^[0-9]\./.test(line) || (line.length < 50 && !/[.,;:]$/.test(line));
    
    // If it's a bullet point, keep it on its own line.
    const isBullet = /^[•\-\*]\s/.test(line);

    if (isCode || isHeading || isBullet) {
      // Flush the current paragraph before starting the new distinct line
      if (currentParagraph) {
        mergedRows.push(currentParagraph);
        currentParagraph = "";
      }
      mergedRows.push(line);
    } else {
      // 2. It's normal text. Append to current paragraph.
      if (currentParagraph) {
        // If the previous line didn't end with punctuation, add a space and join.
        // If it did end with punctuation, add a space (or a newline if you want).
        currentParagraph += " " + line;
      } else {
        currentParagraph = line;
      }

      // 3. Check if this line ends a paragraph
      // If it ends with a period, question mark, or exclamation, we flush the paragraph.
      if (/[.!?]$/.test(line)) {
        mergedRows.push(currentParagraph);
        currentParagraph = "";
      }
    }
  }

  // Push the final paragraph if it exists
  if (currentParagraph) {
    mergedRows.push(currentParagraph);
  }

  // Convert to our 2D grid format (single column)
  const rows: string[][] = mergedRows.map(row => [row]);

  return [{
    id: `table-${pageNumber}-1`,
    pageNumber,
    confidence: 'high',
    headers: ['Content'], 
    rows: rows,
    extractionMethod: 'ocr',
    warnings: []
  }];
}