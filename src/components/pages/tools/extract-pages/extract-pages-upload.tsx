// src/components/pages/tools/extract-pages/extract-pages-upload.tsx
'use client';
import React, { useState } from 'react';

export function ExtractPagesUpload({ onFile, isLoading, error }: { onFile: (f: File) => void, isLoading: boolean, error: string | null }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-300 ease-in-out p-12 sm:p-20 ${
        isDragging 
          ? 'border-primary bg-primary/5 scale-[1.01]' 
          : 'border-border/80 bg-card/30 hover:border-primary/50 hover:bg-card/50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Decorative background gradients */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
        <div className="absolute top-[-20%] right-[-10%] h-[50%] w-[50%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[50%] w-[50%] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="flex flex-col items-center text-center max-w-md mx-auto">
        {/* Animated Icon Container */}
        <div className="mb-6 rounded-2xl bg-blue-50/80 p-4 shadow-sm dark:bg-blue-900/20">
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary"
          >
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 15L10 18L13 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 15L19 18L16 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Drag and drop your PDF file here
        </h2>
        <p className="mb-8 text-sm text-muted-foreground">
          or select a file from your device
        </p>

        {/* Primary Button */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => document.getElementById('pdf-upload')?.click()} 
            className="group relative flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50" 
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="12" y2="12"></line>
                <line x1="15" y1="15" x2="12" y2="12"></line>
              </svg>
            )}
            {isLoading ? 'Loading...' : 'Browse PDF'}
          </button>
        </div>

        <p className="mt-6 text-xs font-medium text-muted-foreground">
          Supports: PDF • Max file size: 100 MB
        </p>

        <input 
          id="pdf-upload" 
          type="file" 
          accept="application/pdf" 
          className="hidden" 
          onChange={(e) => e.target.files?.length && onFile(e.target.files[0])} 
        />
        
        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}