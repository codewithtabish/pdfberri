// src/components/pages/tools/sign-pdf/sign-pdf-coordinate-system.ts

export function normToPdf(
  x: number,
  y: number,
  w: number,
  h: number,
  pageW: number,
  pageH: number
) {
  return {
    x: x * pageW,
    // pdf-lib uses a bottom-left origin, so we flip the Y axis
    y: (1 - y - h) * pageH, 
    width: w * pageW,
    height: h * pageH,
  };
}