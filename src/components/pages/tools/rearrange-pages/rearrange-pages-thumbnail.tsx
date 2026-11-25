'use client';
import { useEffect, useRef } from 'react';
import { renderThumbnail } from './rearrange-pages-renderer';
import type { PageItem } from './rearrange-pages-types';

interface Props {
  item: PageItem;
  index: number;
  bytes: ArrayBuffer;
  isSelected: boolean;
  onToggleSelect: (id: string, multi: boolean) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragEnter: (e: React.DragEvent, index: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

export function RearrangePagesThumbnail({ item, index, bytes, isSelected, onToggleSelect, onDragStart, onDragEnter, onDragEnd }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let isMounted = true;
    const canvas = canvasRef.current;
    const controller = new AbortController();
    if (!canvas) return;

    const render = async () => {
      canvas.width = 0; canvas.height = 0;
      try {
        const task = await renderThumbnail(bytes, item.originalIndex + 1, canvas, controller.signal);
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
  }, [bytes, item.originalIndex]);

  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onClick={(e) => onToggleSelect(item.id, e.ctrlKey || e.metaKey)}
      className={`relative flex flex-col items-center p-2 rounded-lg cursor-grab border-2 transition-all ${
        isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-transparent hover:bg-accent'
      }`}
    >
      <div className="relative w-full aspect-[1/1.4] flex items-center justify-center overflow-hidden border shadow-sm bg-white pointer-events-none">
        <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
      </div>
      <span className={`mt-2 text-xs font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
        {index + 1} <span className="text-[10px] opacity-50">({item.originalIndex + 1})</span>
      </span>
      
      {/* Checkbox overlay */}
      <div className={`absolute top-3 right-3 h-5 w-5 rounded border flex items-center justify-center pointer-events-none ${
        isSelected ? 'bg-primary border-primary text-white' : 'bg-white/80 border-border'
      }`}>
        {isSelected && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M20 6L9 17l-5-5" /></svg>}
      </div>
    </div>
  );
}