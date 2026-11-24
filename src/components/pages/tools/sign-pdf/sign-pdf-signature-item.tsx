import { useRef } from "react";
import type { PlacedElement } from "./sign-pdf-types";
import { TrashIcon } from "@/components/general/icons/pdf-icons";

export function SignPdfSignatureItem({ el, isSelected, onSelect, onUpdate, onDelete, containerRef }: { el: PlacedElement, isSelected: boolean, onSelect: () => void, onUpdate: (upd: Partial<PlacedElement>) => void, onDelete: () => void, containerRef: React.RefObject<HTMLDivElement | null> }) {
  const handleDrag = (e: React.PointerEvent) => {
    if (e.target !== e.currentTarget) return;
    e.preventDefault(); e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const onMove = (me: PointerEvent) => {
      const dx = (me.clientX - startX) / rect.width;
      const dy = (me.clientY - startY) / rect.height;
      onUpdate({ x: Math.max(0, Math.min(1 - el.w, el.x + dx)), y: Math.max(0, Math.min(1 - el.h, el.y + dy)) });
    };
    const onUp = () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
    window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp);
  };

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onPointerDown={handleDrag}
      className={`absolute cursor-move group ${isSelected ? "ring-2 ring-primary ring-offset-2" : "hover:ring-1 hover:ring-primary/50"}`}
      style={{ left: `${el.x * 100}%`, top: `${el.y * 100}%`, width: `${el.w * 100}%`, height: `${el.h * 100}%` }}
    >
      {el.type === "signature" && el.dataUrl ? (
        <img src={el.dataUrl} alt="Signature" className="h-full w-full object-contain pointer-events-none" draggable={false} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-blue-50/50 p-1 text-center text-xs text-blue-900 pointer-events-none">{el.text}</div>
      )}

      {isSelected && (
        <>
          <div
            className="absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-primary bg-background"
            onPointerDown={(e) => {
              e.stopPropagation();
              const startX = e.clientX, startY = e.clientY;
              const rect = containerRef.current?.getBoundingClientRect();
              if (!rect) return;
              const onMove = (me: PointerEvent) => {
                const dw = (me.clientX - startX) / rect.width, dh = (me.clientY - startY) / rect.height;
                onUpdate({ w: Math.max(0.05, Math.min(1 - el.x, el.w + dw)), h: Math.max(0.02, Math.min(1 - el.y, el.h + dh)) });
              };
              const onUp = () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
              window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp);
            }}
          />
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="absolute -top-3 -right-3 rounded-full bg-destructive p-1 text-destructive-foreground hover:opacity-90">
            <TrashIcon className="h-3 w-3" />
          </button>
        </>
      )}
    </div>
  );
}