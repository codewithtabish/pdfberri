'use client';

import { useCallback, useRef, useState } from 'react';
import { Shield } from 'lucide-react';
import { LoaderIcon, UploadIcon } from '@/components/general/icons/pdf-icons';
import { MAX_FILE_MB } from './excel-to-pdf-config';

interface Props {
  onFile: (file: File) => void;
  onCancel: () => void;
  isParsing: boolean;
}

export function ExcelUpload({ onFile, onCancel, isParsing }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      const name = file.name.toLowerCase();
      if (!name.endsWith('.xlsx') && !name.endsWith('.csv')) {
        setError('Please choose an .xlsx or .csv file.');
        return;
      }
      if (file.size === 0) {
        setError('The file is empty.');
        return;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setError(`The file is larger than ${MAX_FILE_MB} MB.`);
        return;
      }
      setError(null);
      onFile(file);
    },
    [onFile]
  );

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file && !isParsing) handleFile(file);
        }}
        className={`flex w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          dragging ? 'border-primary bg-primary/5' : 'border-border bg-card'
        }`}
      >
        <div className="rounded-full bg-primary/10 p-4 text-primary">
          {isParsing ? <LoaderIcon className="h-8 w-8 animate-spin" /> : <UploadIcon className="h-8 w-8" />}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {isParsing ? 'Reading your workbook...' : 'Upload your Excel file'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Drop an .xlsx or .csv file here, or browse your files</p>
        </div>

        {isParsing ? (
          <button
            onClick={onCancel}
            className="rounded-md border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Choose Excel File
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          .xlsx and .csv up to {MAX_FILE_MB} MB. Your file is converted in your browser and never uploaded.
        </p>
      </div>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}