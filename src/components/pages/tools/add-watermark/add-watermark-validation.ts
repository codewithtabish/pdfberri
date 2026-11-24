export function validateWatermarkConfig(config: any): string | null {
  if (config.type === 'text' && !config.text.trim()) return 'Watermark text cannot be empty.';
  if (config.type === 'image' && !config.imageBytes) return 'Please upload an image for the watermark.';
  if (config.opacity < 0 || config.opacity > 1) return 'Opacity must be between 0 and 1.';
  return null;
}

export async function validatePdfFile(file: File): Promise<string | null> {
  if (!file.name.toLowerCase().endsWith('.pdf')) return 'Only PDF files are supported.';
  if (file.size > 100 * 1024 * 1024) return 'File exceeds 100MB limit.';
  return null;
}