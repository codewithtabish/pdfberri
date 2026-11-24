'use client';
import React from 'react';

export function AddWatermarkUpload({ onFile, isLoading, error }: { onFile: (f: File) => void, isLoading: boolean, error: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 border-border">
      <h2 className="text-xl font-semibold mb-2">Select your PDF file</h2>
      <p className="text-sm text-muted-foreground mb-6">Drag and drop your PDF here</p>
      <button onClick={() => document.getElementById('pdf-upload')?.click()} className="rounded bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Choose PDF'}
      </button>
      <input id="pdf-upload" type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.length && onFile(e.target.files[0])} />
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    </div>
  );
}