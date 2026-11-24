"use client";
import { useState, useEffect } from "react";
import { SIGNATURE_FONTS } from "./sign-pdf-constants";
import { generateTypedSignature } from "./sign-pdf-signature-generator";

export function SignPdfTypeSignature({ onSave }: { onSave: (dataUrl: string) => void }) {
  const [text, setText] = useState("");
  const [font, setFont] = useState(SIGNATURE_FONTS[0].value);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (text) setPreview(generateTypedSignature(text, font));
    else setPreview("");
  }, [text, font]);

  return (
    <div className="flex flex-col gap-3">
      <input type="text" placeholder="Type your name" value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      <div className="flex flex-wrap gap-2">
        {SIGNATURE_FONTS.map((f) => (
          <button key={f.name} onClick={() => setFont(f.value)} style={{ fontFamily: f.value }} className={`flex-1 rounded border px-2 py-1 text-lg ${font === f.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}>{f.name}</button>
        ))}
      </div>
      <div className="flex h-24 items-center justify-center rounded border border-border bg-muted/20 overflow-hidden">
        {preview ? <img src={preview} alt="Preview" className="max-h-full" /> : <span className="text-xs text-muted-foreground">Preview</span>}
      </div>
      <button onClick={() => preview && onSave(preview)} disabled={!preview} className="rounded bg-primary py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">Use Signature</button>
    </div>
  );
}