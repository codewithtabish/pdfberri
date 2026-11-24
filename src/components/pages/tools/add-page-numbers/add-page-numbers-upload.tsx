'use client';
import React, { useRef, useState } from 'react';

interface Props {
  onFile: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

export function AddPageNumbersUpload({ onFile, isLoading, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${drag ? 'border-primary bg-primary/5' : 'border-border'}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault(); setDrag(false);
        if (e.dataTransfer.files.length) onFile(e.dataTransfer.files[0]);
      }}
    >
      <svg className="w-12 h-12 mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
      <h2 className="text-xl font-semibold mb-2">Select your PDF file</h2>
      <p className="text-sm text-muted-foreground mb-6">Drag and drop your PDF here</p>
      <button onClick={() => inputRef.current?.click()} className="rounded bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Choose PDF'}
      </button>
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.length && onFile(e.target.files[0])} />
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    </div>
  );
}