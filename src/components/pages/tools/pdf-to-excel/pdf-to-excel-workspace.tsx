'use client';

import { LoaderIcon, SettingsIcon } from "@/components/general/icons/pdf-icons";
import { PdfToExcelProcessing } from "./pdf-to-excel-processing";
import { PdfToExcelUpload } from "./pdf-to-excel-upload";
import { usePdfToExcel } from "./use-pdf-to-excel";
import { PdfToExcelReview } from "./pdf-to-excel-review";
import { PdfToExcelResult } from "./pdf-to-excel-result";
import { PdfToExcelFaq } from "./pdf-to-excel-faq";
import { PdfToExcelRelatedTools } from "./pdf-to-excel-related-tools";
import { PdfToExcelError } from "./pdf-to-excel-error";



export function PdfToExcelWorkspace() {
  const { state, actions } = usePdfToExcel();

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold text-foreground mb-3 tracking-tight">PDF to Excel Converter</h1>
          <p className="text-lg text-muted-foreground">
            Turn tables in your PDF into an editable Excel spreadsheet.<br/>
            Choose your pages, then download your .xlsx file.
          </p>
        </div>
        <div className="w-full md:w-80 h-40 relative flex items-center justify-center">
          {/* Decorative Illustration matching the design */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-24 bg-background rounded-xl shadow-lg border border-border flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 w-full h-6 bg-red-500 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">PDF</span>
              </div>
              <div className="mt-4 space-y-1">
                <div className="w-10 h-1 bg-muted rounded" />
                <div className="w-10 h-1 bg-muted rounded" />
                <div className="w-10 h-1 bg-muted rounded" />
              </div>
            </div>
            <div className="text-primary font-bold text-2xl">→</div>
            <div className="w-20 h-24 bg-background rounded-xl shadow-lg border border-border flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 w-full h-6 bg-green-600 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">XLSX</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-1">
                <div className="w-3 h-3 bg-muted rounded-sm" />
                <div className="w-3 h-3 bg-muted rounded-sm" />
                <div className="w-3 h-3 bg-muted rounded-sm" />
                <div className="w-3 h-3 bg-muted rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-card rounded-2xl shadow-sm border border-border p-4 md:p-6 mb-4">
        {(state.stage === 'idle' || state.stage === 'loading' || state.stage === 'extracting' || state.stage === 'detecting') ? (
           <div className="flex flex-col md:flex-row gap-6">
             <div className="flex-1">
               <PdfToExcelUpload onUpload={actions.uploadAndProcess} isProcessing={state.stage !== 'idle'} />
               {state.fileName && state.stage !== 'idle' && (
                 <div className="mt-4 flex items-center gap-4 p-4 border rounded-xl bg-background">
                    <div className="w-10 h-12 bg-red-100 rounded flex items-center justify-center text-red-600 font-bold text-xs">PDF</div>
                    <div>
                      <p className="font-semibold text-sm">{state.fileName}</p>
                      <p className="text-xs text-muted-foreground">{state.totalPages} pages • {(state.fileSize! / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                 </div>
               )}
             </div>
             {state.stage !== 'idle' ? (
               <div className="md:w-80 border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-6">
                 <PdfToExcelProcessing stage={state.stage} progress={state.progress} />
               </div>
             ) : (
               <div className="md:w-80 border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-6">
                 <div className="flex items-center gap-2 font-bold mb-4">
                   <SettingsIcon className="w-5 h-5 text-primary" />
                   Conversion Settings
                 </div>
                 <div className="space-y-4 opacity-50 pointer-events-none">
                   <div>
                     <p className="text-sm font-medium mb-2">Pages</p>
                     <div className="flex gap-2">
                       <button className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium">All pages</button>
                       <button className="flex-1 bg-muted text-muted-foreground py-2 rounded-lg text-sm font-medium">Custom range</button>
                     </div>
                   </div>
                   <div>
                     <p className="text-sm font-medium mb-2">Sheets</p>
                     <div className="flex gap-2">
                       <button className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium">One sheet per page</button>
                       <button className="flex-1 bg-muted text-muted-foreground py-2 rounded-lg text-sm font-medium">All tables in one sheet</button>
                     </div>
                   </div>
                   <div>
                     <p className="text-sm font-medium mb-2">Number format</p>
                     <div className="flex gap-2">
                       <button className="flex-1 bg-muted text-muted-foreground py-2 rounded-lg text-sm font-medium">Keep as text</button>
                       <button className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium">Detect numbers</button>
                     </div>
                   </div>
                   <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold mt-2 flex items-center justify-center gap-2">
                     Convert to Excel
                   </button>
                 </div>
               </div>
             )}
           </div>
        ) : null}

        {state.stage === 'review' && (
          <PdfToExcelReview 
            state={state} 
            togglePage={actions.togglePageSelection}
            onConvert={actions.convertToExcel}
            onCancel={actions.reset}
            updateSettings={actions.updateSettings}
          />
        )}

        {state.stage === 'generating' && (
          <div className="flex flex-col items-center justify-center py-20">
             <LoaderIcon className="w-12 h-12 text-primary animate-spin mb-4" />
             <p className="text-lg font-semibold">Preparing your Excel workbook...</p>
          </div>
        )}

        {state.stage === 'completed' && (
          <PdfToExcelResult onReset={actions.reset} fileName={state.fileName || 'document'} />
        )}

        {state.stage === 'failed' && (
          <PdfToExcelError error={state.error} onRetry={actions.reset} />
        )}
      </div>

      {state.stage === 'idle' && (
        <>
          <PdfToExcelFaq />
          <PdfToExcelRelatedTools />
        </>
      )}
    </div>
  );
}