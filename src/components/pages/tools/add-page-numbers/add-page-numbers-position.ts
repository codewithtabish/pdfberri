import type { PagePosition } from './add-page-numbers-types';

export function calculatePosition(
  position: PagePosition,
  pageWidth: number,
  pageHeight: number,
  textWidth: number,
  textHeight: number,
  margin: number
): { x: number; y: number } {
  let x = margin;
  let y = margin;

  if (position.includes('left')) {
    x = margin;
  } else if (position.includes('center')) {
    x = (pageWidth - textWidth) / 2;
  } else if (position.includes('right')) {
    x = pageWidth - textWidth - margin;
  }

  // PDF coordinates start from bottom-left
  if (position.includes('top')) {
    y = pageHeight - textHeight - margin;
  } else if (position.includes('bottom')) {
    y = margin;
  }

  return { x, y };
}