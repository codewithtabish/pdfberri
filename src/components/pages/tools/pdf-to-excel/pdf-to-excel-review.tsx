'use client';

import { PdfToExcelState } from './pdf-to-excel-types';
import { SettingsIcon, CheckCircleIcon, FileText, Download, Check } from 'lucide-react';

interface Props {
  state: PdfToExcelState;
  togglePage: (pageNum: number) => void;
  onConvert: () => void;
  onCancel: () => void;
  updateSettings: (settings: Partial<PdfToExcelState['conversionSettings']>) => void;
}

export function PdfToExcelReview({ state, togglePage, onConvert, onCancel, updateSettings }: Props) {
  if (state.extractedTables.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No tables detected</h3>
        <p className="text-muted-foreground mb-6">
          We couldn't find structured tables in this PDF. It may be a scanned document or contain only plain text.
        </p>
        <button onClick={onCancel} className="text-primary hover:underline font-medium">
          Try another file
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left Side - Page Selection */}
      <div className="flex-1">
        <div className="flex items-center gap-4 p-4 border rounded-xl bg-background mb-4">
           <div className="w-10 h-12 bg-red-100 rounded flex items-center justify-center text-red-600 font-bold text-xs">PDF</div>
           <div className="flex-1">
             <p className="font-semibold text-sm">{state.fileName}</p>
             <p className="text-xs text-muted-foreground">{state.totalPages} pages • {(state.fileSize! / 1024 / 1024).toFixed(1)} MB</p>
           </div>
           <button onClick={onCancel} className="text-xs font-semibold px-3 py-1.5 border rounded-lg hover:bg-muted">Replace</button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: state.totalPages }).map((_, i) => {
            const pageNum = i + 1;
            const isSelected = state.selectedPages.has(pageNum);
            const hasTable = state.extractedTables.some(t => t.pageNumber === pageNum);
            
            return (
              <div 
                key={pageNum}
                onClick={() => togglePage(pageNum)}
                className={`relative aspect-3/4 rounded-lg border-2 cursor-pointer transition-all overflow-hidden flex flex-col items-center justify-center bg-white ${
                  isSelected ? 'border-primary shadow-sm' : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-muted-foreground/30 mb-2">
                  <FileText className="w-8 h-8" />
                </div>
                <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded">Page {pageNum}</span>
                {hasTable && (
                  <span className="absolute bottom-2 text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Table</span>
                )}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 flex items-center justify-between border-t pt-4">
           <p className="text-sm text-muted-foreground">
             {state.selectedPages.size} of {state.totalPages} pages selected
           </p>
           <button onClick={onCancel} className="text-sm text-muted-foreground hover:text-foreground">Start over</button>
        </div>
      </div>

      {/* Right Side - Settings & Action */}
      <div className="md:w-80 border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-6 flex flex-col">
        <div className="flex items-center gap-2 font-bold mb-6">
          <SettingsIcon className="w-5 h-5 text-primary" />
          Conversion Settings
        </div>
        
        <div className="space-y-6 flex-1">
          <div>
            <p className="text-sm font-medium mb-2">Pages</p>
            <div className="flex gap-2">
              <button 
                onClick={() => updateSettings({ pages: 'all' })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${state.conversionSettings.pages === 'all' ? 'bg-primary text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              >
                All pages
              </button>
              <button 
                onClick={() => updateSettings({ pages: 'custom' })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${state.conversionSettings.pages === 'custom' ? 'bg-primary text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              >
                Custom range
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Sheets</p>
            <div className="flex gap-2">
              <button 
                onClick={() => updateSettings({ sheets: 'per-page' })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${state.conversionSettings.sheets === 'per-page' ? 'bg-primary text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              >
                One sheet per page
              </button>
              <button 
                onClick={() => updateSettings({ sheets: 'all-one' })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${state.conversionSettings.sheets === 'all-one' ? 'bg-primary text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              >
                All tables in one sheet
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Number format</p>
            <div className="flex gap-2">
              <button 
                onClick={() => updateSettings({ numbers: 'text' })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${state.conversionSettings.numbers === 'text' ? 'bg-primary text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              >
                Keep as text
              </button>
              <button 
                onClick={() => updateSettings({ numbers: 'detect' })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${state.conversionSettings.numbers === 'detect' ? 'bg-primary text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              >
                Detect numbers
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={onConvert}
            disabled={state.selectedPages.size === 0}
            className="w-full bg-primary text-primary-foreground font-bold py-3.5 px-6 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="w-5 h-5" />
            Convert to Excel
          </button>
          <p className="text-xs text-center text-muted-foreground mt-3">
            1 PDF will become 1 Excel file
          </p>
        </div>
      </div>
    </div>
  );
}