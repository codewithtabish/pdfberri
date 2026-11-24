export function parsePageRange(rangeStr: string, maxPages: number): number[] {
  if (!rangeStr.trim()) return [];
  const pages = new Set<number>();
  
  for (const part of rangeStr.split(',')) {
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

export function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 };
}