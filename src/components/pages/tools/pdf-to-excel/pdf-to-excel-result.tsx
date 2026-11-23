'use client';

import { CheckCircleIcon, DownloadIcon, ExcelIcon, RefreshIcon } from "@/components/general/icons/pdf-icons";



interface Props {
  onReset: () => void;
  fileName: string;
}

export function PdfToExcelResult({ onReset, fileName }: Props) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-primary/5 border border-primary/20 rounded-xl">
      <div className="flex items-center gap-4 mb-4 md:mb-0">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
          <CheckCircleIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Your Excel file is ready</h3>
          <p className="text-sm text-muted-foreground">{fileName.replace('.pdf', '')}.xlsx</p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg border border-border text-xs font-medium text-muted-foreground">
          <ExcelIcon className="w-4 h-4 text-primary" /> 3 sheets
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm font-semibold text-foreground bg-background border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
        >
          <RefreshIcon className="w-4 h-4" />
          Start over
        </button>
        <button
          onClick={onReset} // In a real app, this would trigger the blob download again
          className="bg-primary text-primary-foreground font-semibold py-2 px-6 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
        >
          <DownloadIcon className="w-4 h-4" />
          Download Excel
        </button>
      </div>
    </div>
  );
}