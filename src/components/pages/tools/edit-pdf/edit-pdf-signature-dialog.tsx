// src/components/pages/tools/edit-pdf/edit-pdf-signature-dialog.tsx
'use client';

import { useRef, useState } from 'react';
import { EDIT_PDF_CONFIG } from './edit-pdf-constants';
import { Button } from '@/components/ui/button';

interface Props { open: boolean; onClose: () => void; onConfirm: (dataUrl: string) => void; }

export function EditPdfSignatureDialog({ open, onClose, onConfirm }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [has, setHas] = useState(false);
  if (!open) return null;
  const { width, height } = EDIT_PDF_CONFIG.signatureCanvasSize;

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * width, y: ((e.clientY - r.top) / r.height) * height };
  };
  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = ref.current!.getContext('2d')!;
    const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y);
    setDrawing(true); setHas(true);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = ref.current!.getContext('2d')!;
    const p = getPos(e);
    ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#111';
    ctx.lineTo(p.x, p.y); ctx.stroke();
  };
  const end = () => setDrawing(false);
  const clear = () => { const c = ref.current!; c.getContext('2d')!.clearRect(0, 0, c.width, c.height); setHas(false); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-xl bg-card p-4 shadow-xl">
        <h2 className="mb-2 text-lg font-semibold">Draw signature</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Visual signature image only — not a cryptographic digital signature.
        </p>
        <canvas
          ref={ref} width={width} height={height}
          className="w-full cursor-crosshair rounded border bg-white"
          onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerLeave={end}
        />
        <div className="mt-4 flex justify-between">
          <Button variant="outline" onClick={clear}>Clear</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => onConfirm(ref.current!.toDataURL('image/png'))} disabled={!has}>Insert</Button>
          </div>
        </div>
      </div>
    </div>
  );
}