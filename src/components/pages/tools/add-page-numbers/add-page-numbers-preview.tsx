'use client';
import { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { NumberingConfig } from './add-page-numbers-types';
import { formatPageNumber } from './add-page-numbers-format';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface Props {
  bytes: ArrayBuffer;
  pageNumber: number;
  config: NumberingConfig;
  totalSelected: number;
}

export function AddPageNumbersPreview({ bytes, pageNumber, config, totalSelected }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      try {
        // Clone bytes so pdfjs doesn't detach the main state buffer
        const doc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
        const page = await doc.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        const scale = 400 / viewport.width; // Fit to ~400px preview
        const scaled = page.getViewport({ scale });
        
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        
        canvas.width = scaled.width;
        canvas.height = scaled.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        await page.render({ canvasContext: ctx, canvas, viewport: scaled }).promise;
      } catch (err) { /* ignore preview errors */ }
    };
    render();
    return () => { cancelled = true; };
  }, [bytes, pageNumber]);

  const text = formatPageNumber(config.format, pageNumber, totalSelected);
  
  return (
    <div className="relative border bg-white shadow-sm inline-block">
      <canvas ref={canvasRef} className="block max-w-full h-auto" />
      {/* Preview Overlay */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: config.position.includes('top') ? '30px' : 'auto',
          bottom: config.position.includes('bottom') ? '30px' : 'auto',
          left: config.position.includes('left') ? '30px' : config.position.includes('center') ? '50%' : 'auto',
          right: config.position.includes('right') ? '30px' : 'auto',
          transform: config.position.includes('center') ? 'translateX(-50%)' : 'none',
          fontSize: config.fontSize === 'small' ? '10px' : config.fontSize === 'medium' ? '12px' : '16px',
          color: config.color === 'black' ? '#000' : config.color === 'dark-grey' ? '#4b5563' : '#1d4ed8',
          fontWeight: config.isBold ? 'bold' : 'normal',
        }}
      >
        {text}
      </div>
    </div>
  );
}