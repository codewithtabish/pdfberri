export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes <= 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function safePdfName(original: string | null): string {
  const base = (original ?? 'workbook')
    .replace(/\.[^.]+$/, '')
    .replace(/[^\p{L}\p{N}._ -]+/gu, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
  return `${base || 'workbook'}.pdf`;
}

export function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}