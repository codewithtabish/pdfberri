'use client';

import { LoaderIcon } from '@/components/general/icons/pdf-icons';
import { ProcessingStage } from './pdf-to-excel-types';

interface Props {
  stage: ProcessingStage;
  progress: number;
}

const stageMessages: Record<string, string> = {
  validating: 'Checking your PDF...',
  loading: 'Reading your document...',
  extracting: 'Extracting document content...',
  detecting: 'Finding tables and columns...',
  review: 'Finalizing extraction...'
};

export function PdfToExcelProcessing({ stage, progress }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <LoaderIcon className="w-6 h-6 text-primary animate-spin" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-4">{stageMessages[stage] || 'Processing...'}</h3>
      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <div 
          className="bg-primary h-full transition-all duration-300 ease-out"
          style={{ width: `${Math.max(5, progress)}%` }}
        />
      </div>
    </div>
  );
}