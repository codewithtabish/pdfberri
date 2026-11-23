'use client';

import { useRef, useState } from 'react';

interface Props {
  onUpload: (file: File) => void;
  isProcessing: boolean;
}

export function PdfToExcelUpload({ onUpload, isProcessing }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      onUpload(file);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div 
        className={`w-full border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-blue-200 bg-blue-50/50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
        }}
      >
        <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4">
          <UploadIcon className="w-8 h-8 text-primary" />
        </div>
        
        <h3 className="text-xl font-bold mb-4">Select your PDF to convert</h3>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="bg-primary text-primary-foreground font-semibold py-2.5 px-8 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
        >
          {isProcessing ? (
            <LoaderIcon className="w-5 h-5 animate-spin" />
          ) : (
            <UploadIcon className="w-5 h-5" />
          )}
          {isProcessing ? 'Processing...' : 'Select PDF'}
        </button>
        
        <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" /> PDF files up to 50 MB. Your files are secure and private.
        </p>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".pdf,application/pdf"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
          }}
        />
      </div>
    </div>
  );
}

// Ensure Shield is imported if not defined
import { Shield } from 'lucide-react';
import { LoaderIcon, UploadIcon } from '@/components/general/icons/pdf-icons';
