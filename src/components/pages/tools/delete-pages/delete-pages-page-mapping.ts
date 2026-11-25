export function getRemainingIndices(totalPages: number, deletedIndices: number[]): number[] {
  const all = Array.from({ length: totalPages }, (_, i) => i);
  return all.filter(i => !deletedIndices.includes(i));
}