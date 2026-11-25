export function validateSelection(deletedIndices: number[], pageCount: number): string | null {
  if (deletedIndices.length === 0) return 'Please select at least one page to delete.';
  if (deletedIndices.length >= pageCount) return 'You cannot delete all pages. At least one page must remain.';
  if (deletedIndices.some(i => i < 0 || i >= pageCount)) return 'Selected page is out of range.';
  return null;
}