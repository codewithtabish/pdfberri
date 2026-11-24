// src/components/pages/tools/edit-pdf/edit-pdf-upload.tsx
'use client';

import { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onFile: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

export function EditPdfUpload({ onFile, isLoading, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  return (
    <div
      className={`rounded-xl border-2 border-dashed p-12 text-center transition ${drag ? 'border-primary bg-primary/5' : 'border-border'}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault(); setDrag(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
    >
      <UploadCloud className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
      <p className="mb-2 text-lg font-medium">Drag & drop a PDF</p>
      <p className="mb-4 text-sm text-muted-foreground">Files stay on your device</p>
      <Button onClick={() => inputRef.current?.click()} disabled={isLoading}>
        {isLoading ? 'Loading…' : 'Select PDF'}
      </Button>
      <input ref={inputRef} type="file" accept="application/pdf" hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    </div>
  );
}