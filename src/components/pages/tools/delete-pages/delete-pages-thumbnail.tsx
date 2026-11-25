'use client';
import { useEffect, useRef } from 'react';
import { renderThumbnail } from './delete-pages-renderer';

export function DeletePagesThumbnail({ bytes, index, isSelected, onToggle }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let isMounted = true;
    const canvas = canvasRef.current;
    const controller = new AbortController();
    if (!canvas) return;

    const render = async () => {
      canvas.width = 0; canvas.height = 0;
      try {
        const task = await renderThumbnail(bytes, index + 1, canvas, controller.signal);
        if (!task || !isMounted) return;
        await task.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException' && err?.name !== 'AbortError' && !err?.message?.includes('cancelled')) {
          console.error(err);
        }
      }
    };
    render();
    return () => { isMounted = false; controller.abort(); };
  }, [bytes, index]);

  return (
    <div onClick={onToggle} className={`relative flex flex-col items-center p-2 rounded-lg cursor-pointer border-2 transition-all ${isSelected ? 'border-red-500 bg-red-50' : 'border-transparent hover:bg-accent'}`}>
      <div className="relative w-full aspect-[1/1.4] flex items-center justify-center overflow-hidden border shadow-sm bg-white">
        <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
      </div>
      <span className={`mt-2 text-xs font-medium ${isSelected ? 'text-red-600' : 'text-muted-foreground'}`}>{index + 1}</span>
      <div className={`absolute top-3 right-3 h-5 w-5 rounded border flex items-center justify-center ${isSelected ? 'bg-red-500 border-red-500 text-white' : 'bg-white/80 border-border'}`}>
        {isSelected && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M20 6L9 17l-5-5" /></svg>}
      </div>
    </div>
  );
}