import { rgb, degrees } from 'pdf-lib';
import { hexToRgb } from './add-watermark-utils';
import { calculatePosition } from './add-watermark-position-calculator';
import type { WatermarkConfig } from './add-watermark-types';

export function drawTextWatermark(page: any, config: WatermarkConfig, font: any) {
  const { width, height } = page.getSize();
  const textWidth = font.widthOfTextAtSize(config.text, config.fontSize);
  const textHeight = font.heightAtSize(config.fontSize);
  const color = hexToRgb(config.color);

  const { x, y } = calculatePosition(config.position, width, height, textWidth, textHeight);

  page.drawText(config.text, {
    x: x + textWidth / 2,
    y: y + textHeight / 2,
    size: config.fontSize,
    font: font,
    color: rgb(color.r, color.g, color.b),
    opacity: config.opacity,
    rotate: degrees(config.rotation),
  });
}