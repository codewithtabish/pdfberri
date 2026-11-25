export function validateSelection(indices: number[], pageCount: number): string | null {
  if (indices.length === 0) return 'Please select at least one page to extract.';
  if (indices.some(i => i < 0 || i >= pageCount)) return 'Selected page is out of range.';
  return null;
}