// pdf-lib handles opacity via the `opacity` property in drawText/drawImage.
// This file is maintained for architectural completeness.
export function clampOpacity(opacity: number): number {
  return Math.max(0.01, Math.min(1, opacity));
}