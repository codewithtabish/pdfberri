export type ProcessingStage = 
  | 'idle' | 'validating' | 'loading' | 'analyzing' | 'extracting' 
  | 'detecting' | 'review' | 'generating' | 'completed' | 'failed';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ExtractedCell {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExtractedTable {
  id: string;
  pageNumber: number;
  confidence: ConfidenceLevel;
  headers: string[];
  rows: string[][];
  extractionMethod: 'text-layer' | 'ocr';
  warnings: string[];
}

export interface PdfToExcelState {
  stage: ProcessingStage;
  progress: number;
  error: string | null;
  fileName: string | null;
  fileSize: number | null;
  totalPages: number;
  selectedPages: Set<number>;
  extractedTables: ExtractedTable[];
  selectedTableIds: Set<string>;
  isScanned: boolean;
  conversionSettings: {
    pages: 'all' | 'custom';
    sheets: 'per-page' | 'all-one';
    numbers: 'text' | 'detect';
  };
}