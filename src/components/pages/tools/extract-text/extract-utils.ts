export function parsePageRanges(input: string, maxPages: number): number[] {
  if (!input.trim()) return [];
  
  const pages = new Set<number>();
  const parts = input.split(",");

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes("-")) {
      const [startStr, endStr] = trimmed.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      
      if (isNaN(start) || isNaN(end) || start < 1 || end > maxPages || start > end) {
        throw new Error(`Invalid range: ${trimmed}. Pages must be between 1 and ${maxPages}.`);
      }
      
      for (let i = start; i <= end; i++) {
        pages.add(i);
      }
    } else {
      const page = parseInt(trimmed, 10);
      if (isNaN(page) || page < 1 || page > maxPages) {
        throw new Error(`Invalid page: ${trimmed}. Pages must be between 1 and ${maxPages}.`);
      }
      pages.add(page);
    }
  }

  // Return sorted array of 1-based page numbers
  return Array.from(pages).sort((a, b) => a - b);
}

export function getExtractedFileName(original: string): string {
  const base = original.replace(/\.pdf$/i, "");
  return `${base}-extracted.txt`;
}

export function countWords(text: string): number {
  // Simple word count based on whitespace. 
  // Note: For languages like Chinese/Japanese without spaces, this will undercount.
  return text.trim().split(/\s+/).filter(Boolean).length;
}