export function getRearrangedFilename(original: string): string {
  return original.replace(/\.pdf$/i, '-rearranged.pdf');
}