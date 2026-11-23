import { useState, useCallback } from 'react';
import { processPdfToExcel } from './pdf-to-excel-engine';
import { generateExcelWorkbook } from './pdf-to-excel-export';
import { PdfToExcelState, ProcessingStage } from './pdf-to-excel-types';

const initialState: PdfToExcelState = {
  stage: 'idle',
  progress: 0,
  error: null,
  fileName: null,
  fileSize: null,
  totalPages: 0,
  selectedPages: new Set(),
  extractedTables: [],
  selectedTableIds: new Set(),
  isScanned: false,
  conversionSettings: {
    pages: 'all',
    sheets: 'per-page',
    numbers: 'detect',
  },
};

export function usePdfToExcel() {
  const [state, setState] = useState<PdfToExcelState>(initialState);

  const reset = useCallback(() => setState(initialState), []);

  const updateSettings = useCallback((settings: Partial<PdfToExcelState['conversionSettings']>) => {
    setState(prev => ({
      ...prev,
      conversionSettings: { ...prev.conversionSettings, ...settings }
    }));
  }, []);

  const uploadAndProcess = useCallback(async (file: File) => {
    setState(prev => ({
      ...prev,
      stage: 'loading',
      fileName: file.name,
      fileSize: file.size,
      error: null,
    }));

    try {
      const { tables, totalPages, isScanned } = await processPdfToExcel(
        file,
        (stage, progress) => setState(prev => ({ ...prev, stage, progress }))
      );

      setState(prev => ({
        ...prev,
        stage: 'review',
        progress: 100,
        totalPages,
        selectedPages: new Set(Array.from({ length: totalPages }, (_, i) => i + 1)),
        extractedTables: tables,
        selectedTableIds: new Set(tables.map(t => t.id)),
        isScanned,
      }));

    } catch (err: any) {
      setState(prev => ({
        ...prev,
        stage: 'failed',
        error: err.message || 'Failed to process PDF.',
      }));
    }
  }, []);

  const togglePageSelection = useCallback((pageNum: number) => {
    setState(prev => {
      const newSet = new Set(prev.selectedPages);
      if (newSet.has(pageNum)) newSet.delete(pageNum);
      else newSet.add(pageNum);
      return { ...prev, selectedPages: newSet };
    });
  }, []);

  const convertToExcel = useCallback(async () => {
    const filteredTables = state.extractedTables.filter(t => state.selectedPages.has(t.pageNumber));
    if (filteredTables.length === 0) return;

    setState(prev => ({ ...prev, stage: 'generating' }));

    try {
      const blob = await generateExcelWorkbook(filteredTables, state.conversionSettings);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${state.fileName?.replace('.pdf', '') || 'converted'}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setState(prev => ({ ...prev, stage: 'completed' }));
    } catch (err) {
      setState(prev => ({ ...prev, stage: 'failed', error: 'Failed to generate Excel file.' }));
    }
  }, [state.extractedTables, state.selectedPages, state.conversionSettings, state.fileName]);

  return {
    state,
    actions: { uploadAndProcess, togglePageSelection, updateSettings, convertToExcel, reset }
  };
}