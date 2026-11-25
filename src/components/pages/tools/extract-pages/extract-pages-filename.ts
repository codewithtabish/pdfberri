export function getExtractedFilename(original: string, isCombined: boolean, pageNum?: number): string {
  const base = original.replace(/\.pdf$/i, '');
  if (isCombined) return `${base}-extracted.pdf`;
  return `${base}-page-${pageNum}.pdf`;
}