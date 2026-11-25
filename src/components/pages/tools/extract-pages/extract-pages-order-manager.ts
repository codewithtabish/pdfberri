export function ensureSortedOrder(indices: number[]): number[] {
  return [...indices].sort((a, b) => a - b);
}