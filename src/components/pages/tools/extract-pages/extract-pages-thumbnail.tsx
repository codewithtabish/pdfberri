// src/components/pages/tools/extract-pages/extract-pages-thumbnail.tsx
'use client';
import { useEffect, useRef } from 'react';
import { renderThumbnail } from './extract-pages-renderer';

export function ExtractPagesThumbnail({ bytes, index, isSelected, onToggle }: { 
  bytes: ArrayBuffer; 
  index: number; 
  isSelected: boolean; 
  onToggle: () => void 
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let isMounted = true;
    const canvas = canvasRef.current;
    const controller = new AbortController();

    if (!canvas) return;

    const render = async () => {
      canvas.width = 0;
      canvas.height = 0;

      try {
        const task = await renderThumbnail(bytes, index + 1, canvas, controller.signal);
        
        // If the component unmounted or aborted, task will be null
        if (!task || !isMounted) return;

        await task.promise;
      } catch (err: any) {
        // Catch any remaining errors just in case
        if (err?.name !== 'RenderingCancelledException' && err?.name !== 'AbortError') {
          console.error('Thumbnail render error:', err);
        }
      }
    };

    render();

    return () => {
      isMounted = false;
      // Abort the render task quietly instead of throwing an exception
      controller.abort();
    };
  }, [bytes, index]);

  return (
    <div 
      onClick={onToggle} 
      className={`relative flex flex-col items-center p-2 rounded-lg cursor-pointer border-2 transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-accent'}`}
    >
      <div className="relative w-full aspect-[1/1.4] flex items-center justify-center overflow-hidden border shadow-sm bg-white">
        <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
      </div>
      <span className="mt-2 text-xs font-medium text-muted-foreground">{index + 1}</span>
      <div className={`absolute top-3 right-3 h-5 w-5 rounded border flex items-center justify-center ${isSelected ? 'bg-primary border-primary text-white' : 'bg-white/80 border-border'}`}>
        {isSelected && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M20 6L9 17l-5-5" /></svg>}
      </div>
    </div>
  );
}