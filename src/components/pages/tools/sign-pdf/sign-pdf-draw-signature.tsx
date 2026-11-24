"use client";
import { useRef, useState, useEffect } from "react";
import { TrashIcon } from "@/components/general/icons/pdf-icons";
import { setupCanvas } from "./sign-pdf-drawing-engine";

export function SignPdfDrawSignature({ onSave }: { onSave: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (canvasRef.current) setupCanvas(canvasRef.current);
  }, []);

  const startDraw = (e: React.PointerEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const endDraw = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    canvasRef.current?.releasePointerCapture(e.pointerId);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-lg border-2 border-dashed border-border bg-muted/20">
        <canvas ref={canvasRef} className="h-32 w-full cursor-crosshair touch-none" onPointerDown={startDraw} onPointerMove={draw} onPointerUp={endDraw} onPointerCancel={endDraw} />
      </div>
      <div className="flex gap-2">
        <button onClick={clear} className="flex flex-1 items-center justify-center gap-1 rounded border border-border py-1.5 text-xs hover:bg-muted"><TrashIcon className="h-3 w-3" /> Clear</button>
        <button onClick={() => canvasRef.current && onSave(canvasRef.current.toDataURL("image/png"))} className="flex flex-1 items-center justify-center rounded bg-primary py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">Use Signature</button>
      </div>
    </div>
  );
}