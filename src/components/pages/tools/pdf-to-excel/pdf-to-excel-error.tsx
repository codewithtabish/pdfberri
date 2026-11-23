'use client';

import { AlertCircleIcon, RefreshIcon } from "@/components/general/icons/pdf-icons";


interface Props {
  error: string | null;
  onRetry: () => void;
}

export function PdfToExcelError({ error, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
        <AlertCircleIcon className="w-8 h-8" />
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-2">
        Something went wrong
      </h3>
      
      <p className="text-muted-foreground mb-8 max-w-md">
        {error || 'An unexpected error occurred while processing your PDF. Please try again.'}
      </p>

      <button
        onClick={onRetry}
        className="bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
      >
        <RefreshIcon className="w-5 h-5" />
        Try Again
      </button>
    </div>
  );
}