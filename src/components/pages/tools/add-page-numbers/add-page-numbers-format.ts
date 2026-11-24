// src/components/pages/tools/add-page-numbers/add-page-numbers-format.ts
import type { NumberFormat } from './add-page-numbers-types';

export function formatPageNumber(
  format: NumberFormat,
  currentNumber: number,
  totalSelectedPages: number, // The COUNT of pages in the range, not the doc total
  startNumber: number
): string {
  // Ensure everything is a valid integer
  const safeCurrent = Math.floor(Number(currentNumber) || 1);
  const safeTotal = Math.floor(Number(totalSelectedPages) || 1);
  const safeStart = Math.floor(Number(startNumber) || 1);

  switch (format) {
    case 'numeric':
      return `${safeCurrent}`;
    case 'page-x':
      return `Page ${safeCurrent}`;
    case 'page-x-of-y': {
      // If you select 3 pages and start at 5:
      // Start (5) + Total (3) - 1 = 7. So it goes 5, 6, 7.
      const finalTotal = safeStart + safeTotal - 1;
      return `Page ${safeCurrent} of ${finalTotal}`;
    }
    default:
      return `${safeCurrent}`;
  }
}