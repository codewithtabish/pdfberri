import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { NumberingConfig } from './add-page-numbers-types';
import { formatPageNumber } from './add-page-numbers-format';
import { calculatePosition } from './add-page-numbers-position';

export async function generateNumberedPdf(
  originalBytes: ArrayBuffer,
  config: NumberingConfig,
  selectedPages: number[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(originalBytes);
  const pages = pdfDoc.getPages();
  const totalNumbered = selectedPages.length;

  const font = await pdfDoc.embedFont(
    config.isBold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica
  );

  const fontSizeMap = { small: 10, medium: 12, large: 16 };
  const size = fontSizeMap[config.fontSize];

  const colorMap = {
    'black': rgb(0, 0, 0),
    'dark-grey': rgb(0.3, 0.3, 0.3),
    'blue': rgb(0.1, 0.3, 0.8),
  };
  const color = colorMap[config.color];
  const margin = 30; 

  let currentNumber = config.startNumber;

  for (const pageIndex of selectedPages) {
    const page = pages[pageIndex];
    const { width, height } = page.getSize();

    const text = formatPageNumber(config.format, currentNumber, totalNumbered);
    const textWidth = font.widthOfTextAtSize(text, size);
    const textHeight = font.heightAtSize(size);

    const { x, y } = calculatePosition(
      config.position, width, height, textWidth, textHeight, margin
    );

    page.drawText(text, { x, y, size, font, color });
    currentNumber++;
  }

  return await pdfDoc.save();
}