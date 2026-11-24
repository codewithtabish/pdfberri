"use client";
import { useState } from "react";
import { SignPdfSignatureTabs } from "./sign-pdf-signature-tabs";
import { SignPdfDrawSignature } from "./sign-pdf-draw-signature";
import { SignPdfTypeSignature } from "./sign-pdf-type-signature";
import { SignPdfUploadSignature } from "./sign-pdf-upload-signature";
import { SignPdfSignaturePreview } from "./sign-pdf-signature-preview";
import { CalendarIcon, TextIcon, PenToolIcon } from "@/components/general/icons/pdf-icons";
import type { FieldType, SignatureTab } from "./sign-pdf-types";

export function SignPdfSignaturePanel({ onAddElement }: { onAddElement: (type: FieldType, dataUrl?: string, text?: string) => void }) {
  const [tab, setTab] = useState<SignatureTab>("draw");
  const [signature, setSignature] = useState<string | null>(null);

  const handleAddText = (type: FieldType) => {
    const text = type === "date" ? new Date().toLocaleDateString() : window.prompt(`Enter ${type}`);
    if (text) onAddElement(type, undefined, text);
  };

  return (
    <aside className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold">Create Signature</h3>
      <div className="mt-3"><SignPdfSignatureTabs active={tab} onChange={setTab} /></div>
      
      <div className="mt-4 flex-1">
        {signature ? (
          <div className="space-y-4">
            <SignPdfSignaturePreview dataUrl={signature} onClear={() => setSignature(null)} />
            <button onClick={() => { onAddElement("signature", signature); setSignature(null); }} className="w-full rounded bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Add to Document</button>
          </div>
        ) : (
          <>
            {tab === "draw" && <SignPdfDrawSignature onSave={setSignature} />}
            {tab === "type" && <SignPdfTypeSignature onSave={setSignature} />}
            {tab === "upload" && <SignPdfUploadSignature onSave={setSignature} />}
          </>
        )}
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Add Fields</h4>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button onClick={() => handleAddText("date")} className="flex items-center justify-center gap-1.5 rounded border border-border py-1.5 text-xs hover:bg-muted"><CalendarIcon className="h-3.5 w-3.5" /> Date</button>
          <button onClick={() => handleAddText("initials")} className="flex items-center justify-center gap-1.5 rounded border border-border py-1.5 text-xs hover:bg-muted"><TextIcon className="h-3.5 w-3.5" /> Initials</button>
          <button onClick={() => handleAddText("text")} className="col-span-2 flex items-center justify-center gap-1.5 rounded border border-border py-1.5 text-xs hover:bg-muted"><PenToolIcon className="h-3.5 w-3.5" /> Text Box</button>
        </div>
      </div>
    </aside>
  );
}