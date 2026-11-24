export function getWatermarkedFilename(original: string): string {
  return original.replace(/\.pdf$/i, '-watermarked.pdf');
}