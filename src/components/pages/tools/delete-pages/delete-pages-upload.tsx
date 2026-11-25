'use client';
import React, { useState } from 'react';

export function DeletePagesUpload({ onFile, isLoading, error }: { onFile: (f: File) => void, isLoading: boolean, error: string | null }) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div 
      className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-300 ease-in-out p-12 sm:p-20 ${
        isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border/80 bg-card/30 hover:border-primary/50 hover:bg-card/50'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files.length) onFile(e.dataTransfer.files[0]); }}
    >
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
        <div className="absolute top-[-20%] right-[-10%] h-[50%] w-[50%] rounded-full bg-red-500/5 blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[50%] w-[50%] rounded-full bg-red-500/5 blur-[100px]" />
      </div>
      <div className="flex flex-col items-center text-center max-w-md mx-auto">
        <div className="mb-6 rounded-2xl bg-red-50 p-4 shadow-sm dark:bg-red-900/20">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-red-500">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2"/>
            <path d="M10 12L14 16M14 12L10 16" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Drag and drop your PDF file here</h2>
        <p className="mb-8 text-sm text-muted-foreground">or select a file from your device</p>
        <button 
          onClick={() => document.getElementById('pdf-upload')?.click()} 
          className="group relative flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md disabled:opacity-50" 
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Browse PDF'}
        </button>
        <p className="mt-6 text-xs font-medium text-muted-foreground">Supports: PDF • Max file size: 100 MB</p>
        <input id="pdf-upload" type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.length && onFile(e.target.files[0])} />
        {error && <div className="mt-6 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">{error}</div>}
      </div>
    </div>
  );
}