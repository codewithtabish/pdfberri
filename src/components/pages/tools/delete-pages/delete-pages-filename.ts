export function getDeletedFilename(original: string): string {
  return original.replace(/\.pdf$/i, '-updated.pdf');
}