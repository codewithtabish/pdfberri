'use client';
import { useEffect, useRef } from 'react';
import { renderPdfPageToCanvas } from './add-watermark-pdf-renderer';
import { calculatePosition } from './add-watermark-position-calculator';
import type { WatermarkConfig } from './add-watermark-types';

export function AddWatermarkPreview({ bytes, pageNumber, config, zoom = 1 }: { bytes: ArrayBuffer, pageNumber: number, config: WatermarkConfig, zoom?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      renderPdfPageToCanvas(bytes, pageNumber, canvasRef.current, zoom * 0.8).catch(() => {});
    }
  }, [bytes, pageNumber, zoom]);

  const baseWidth = canvasRef.current?.width || 400;
  const baseHeight = canvasRef.current?.height || 500;

  let itemW = 0, itemH = 0;
  if (config.type === 'text') {
    itemW = config.text.length * config.fontSize * 0.5;
    itemH = config.fontSize;
  } else {
    itemW = (config.imageScale / 100) * baseWidth;
    itemH = itemW;
  }

  const pos = calculatePosition(config.position, baseWidth, baseHeight, itemW, itemH);
  const screenX = pos.x;
  const screenY = baseHeight - pos.y - itemH;

  return (
    <div className="relative border bg-white shadow-sm inline-block">
      <canvas ref={canvasRef} className="block max-w-full h-auto" />
      <div
        className="absolute pointer-events-none origin-center flex items-center justify-center font-bold whitespace-nowrap"
        style={{
          left: screenX + itemW / 2,
          top: screenY + itemH / 2,
          transform: `translate(-50%, -50%) rotate(${config.rotation}deg)`,
          opacity: config.opacity,
          color: config.color,
          fontSize: config.fontSize * zoom,
          fontFamily: config.fontFamily,
        }}
      >
        {config.type === 'text' && config.text}
        {config.type === 'image' && config.imageFile && (
           <img src={URL.createObjectURL(config.imageFile)} style={{ width: itemW, height: 'auto' }} alt="Watermark" />
        )}
      </div>
    </div>
  );
}