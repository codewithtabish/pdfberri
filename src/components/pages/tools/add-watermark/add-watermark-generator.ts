import { PDFDocument } from 'pdf-lib';
import type { WatermarkConfig } from './add-watermark-types';
import { getStandardFont } from './add-watermark-font-manager';
import { drawTextWatermark } from './add-watermark-text-renderer';
import { drawImageWatermark } from './add-watermark-image-renderer';

export async function generateWatermarkedPdf(
  originalBytes: ArrayBuffer,
  config: WatermarkConfig,
  selectedPages: number[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(originalBytes);
  const pages = pdfDoc.getPages();

  let font, image;
  if (config.type === 'text') {
    font = await pdfDoc.embedFont(getStandardFont(config.fontFamily));
  } else if (config.imageBytes && config.imageType) {
    image = config.imageType === 'png' 
      ? await pdfDoc.embedPng(config.imageBytes)
      : await pdfDoc.embedJpg(config.imageBytes);
  }

  for (const pageIndex of selectedPages) {
    const page = pages[pageIndex];
    if (config.type === 'text' && font) {
      drawTextWatermark(page, config, font);
    } else if (config.type === 'image' && image) {
      drawImageWatermark(page, config, image);
    }
  }

  return await pdfDoc.save();
}