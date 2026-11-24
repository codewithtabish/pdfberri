import { degrees } from 'pdf-lib';
import { calculatePosition } from './add-watermark-position-calculator';
import type { WatermarkConfig } from './add-watermark-types';

export function drawImageWatermark(page: any, config: WatermarkConfig, image: any) {
  const { width, height } = page.getSize();
  const imgWidth = (config.imageScale / 100) * width;
  const imgHeight = (image.height / image.width) * imgWidth;

  const { x, y } = calculatePosition(config.position, width, height, imgWidth, imgHeight);

  page.drawImage(image, {
    x: x + imgWidth / 2,
    y: y + imgHeight / 2,
    width: imgWidth,
    height: imgHeight,
    opacity: config.opacity,
    rotate: degrees(config.rotation),
  });
}