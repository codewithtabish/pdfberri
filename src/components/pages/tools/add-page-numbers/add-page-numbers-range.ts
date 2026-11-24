export function parsePageRange(rangeStr: string, maxPages: number): number[] {
  if (!rangeStr.trim()) return [];
  
  const pages = new Set<number>();
  const parts = rangeStr.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (isNaN(start) || isNaN(end) || start > end || start < 1 || end > maxPages) {
        throw new Error(`Invalid range: ${trimmed}. Ensure it is within 1 and ${maxPages}.`);
      }

      for (let i = start; i <= end; i++) {
        pages.add(i - 1); // 0-based index
      }
    } else {
      const page = parseInt(trimmed, 10);
      if (isNaN(page) || page < 1 || page > maxPages) {
        throw new Error(`Invalid page number: ${trimmed}`);
      }
      pages.add(page - 1);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}