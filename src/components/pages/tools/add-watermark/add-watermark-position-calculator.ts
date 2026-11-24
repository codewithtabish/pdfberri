import type { Position } from './add-watermark-types';

export function calculatePosition(
  position: Position,
  pageWidth: number,
  pageHeight: number,
  itemWidth: number,
  itemHeight: number,
  margin = 40
): { x: number, y: number } {
  let x = 0;
  let y = 0;

  if (position.includes('left')) x = margin;
  else if (position.includes('center')) x = (pageWidth - itemWidth) / 2;
  else if (position.includes('right')) x = pageWidth - itemWidth - margin;

  if (position.includes('top')) y = pageHeight - itemHeight - margin;
  else if (position.includes('center')) y = (pageHeight - itemHeight) / 2;
  else if (position.includes('bottom')) y = margin;

  return { x, y };
}