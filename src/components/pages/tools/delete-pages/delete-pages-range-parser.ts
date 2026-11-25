export function parsePageRange(input: string, maxPages: number): number[] {
  const pages = new Set<number>();
  if (!input.trim()) return [];

  const parts = input.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (isNaN(start) || isNaN(end) || start > end || start < 1 || end > maxPages) {
        throw new Error(`Invalid range: ${trimmed}`);
      }
      for (let i = start; i <= end; i++) pages.add(i - 1);
    } else {
      const page = parseInt(trimmed, 10);
      if (isNaN(page) || page < 1 || page > maxPages) throw new Error(`Invalid page: ${trimmed}`);
      pages.add(page - 1);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}