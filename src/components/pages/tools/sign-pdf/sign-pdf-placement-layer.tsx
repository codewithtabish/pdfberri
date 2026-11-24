import type { PlacedElement } from "./sign-pdf-types";
import { SignPdfSignatureItem } from "./sign-pdf-signature-item";

interface Props {
  pageIndex: number; elements: PlacedElement[]; selectedId: string | null;
  onSelect: (id: string | null) => void; onUpdate: (id: string, updates: Partial<PlacedElement>) => void;
  onDelete: (id: string) => void; containerRef: React.RefObject<HTMLDivElement | null>;
}

export function SignPdfPlacementLayer({ pageIndex, elements, selectedId, onSelect, onUpdate, onDelete, containerRef }: Props) {
  return (
    <div className="absolute inset-0 z-10">
      {elements.filter((el) => el.pageIndex === pageIndex).map((el) => (
        <SignPdfSignatureItem key={el.id} el={el} isSelected={selectedId === el.id} onSelect={() => onSelect(el.id)} onUpdate={(upd) => onUpdate(el.id, upd)} onDelete={() => onDelete(el.id)} containerRef={containerRef} />
      ))}
    </div>
  );
}