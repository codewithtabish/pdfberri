export function togglePageSelection(selected: number[], index: number): number[] {
  if (selected.includes(index)) return selected.filter(i => i !== index);
  return [...selected, index].sort((a, b) => a - b);
}

export function selectAllPages(total: number): number[] {
  return Array.from({ length: total }, (_, i) => i);
}

export function invertSelection(selected: number[], total: number): number[] {
  const all = selectAllPages(total);
  return all.filter(i => !selected.includes(i));
}