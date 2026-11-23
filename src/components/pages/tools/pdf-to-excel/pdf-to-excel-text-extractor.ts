import { PDFPageProxy } from 'pdfjs-dist';
import { ExtractedCell } from './pdf-to-excel-types';

export async function extractTextWithCoordinates(page: PDFPageProxy): Promise<ExtractedCell[]> {
  const textContent = await page.getTextContent();
  const cells: ExtractedCell[] = [];

  for (const item of textContent.items) {
    if ('str' in item && item.str.trim().length > 0) {
      const transform = item.transform;
      cells.push({
        text: item.str,
        x: transform[4],
        y: transform[5],
        width: item.width,
        height: item.height,
      });
    }
  }
  return cells;
}