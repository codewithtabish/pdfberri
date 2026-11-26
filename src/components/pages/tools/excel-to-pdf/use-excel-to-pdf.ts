import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_SETTINGS } from './excel-to-pdf-config';
import {
  ConversionError,
  type ConversionSettings,
  type ConvertProgress,
  type ParsedWorkbook,
  type SheetInfo,
} from './excel-to-pdf-types';

export type Stage = 'idle' | 'parsing' | 'ready' | 'converting' | 'done';

export interface ResultSummary {
  url: string;
  pageCount: number;
  pageSheets: string[];
  size: number;
  warnings: string[];
}

export interface ExcelToPdfState {
  stage: Stage;
  error: string | null;
  fileName: string | null;
  fileSize: number;
  sheets: SheetInfo[];
  selected: Set<number>;
  settings: ConversionSettings;
  progress: ConvertProgress | null;
  warnings: string[];
  result: ResultSummary | null;
}

const initialState: ExcelToPdfState = {
  stage: 'idle',
  error: null,
  fileName: null,
  fileSize: 0,
  sheets: [],
  selected: new Set(),
  settings: DEFAULT_SETTINGS,
  progress: null,
  warnings: [],
  result: null,
};

export function useExcelToPdf() {
  const [state, setState] = useState<ExcelToPdfState>(initialState);

  // Heavy workbook data stays out of React state
  const workbookRef = useRef<ParsedWorkbook | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const urlRef = useRef<string | null>(null);
  const jobRef = useRef(0);

  const dropResult = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const reset = useCallback(() => {
    jobRef.current++;
    abortRef.current?.abort();
    dropResult();
    workbookRef.current = null;
    setState((prev) => ({ ...initialState, settings: prev.settings }));
  }, [dropResult]);

  const selectFile = useCallback(
    async (file: File) => {
      abortRef.current?.abort();
      dropResult();
      workbookRef.current = null;

      const job = ++jobRef.current;
      const controller = new AbortController();
      abortRef.current = controller;

      setState((prev) => ({
        ...initialState,
        settings: prev.settings,
        stage: 'parsing',
        fileName: file.name,
        fileSize: file.size,
      }));

      try {
        const { parseWorkbookFile, toSheetInfo } = await import('./excel-to-pdf-parser');
        const wb = await parseWorkbookFile(file, controller.signal);
        if (job !== jobRef.current) return;

        workbookRef.current = wb;
        const infos = wb.sheets.map(toSheetInfo);
        setState((prev) => ({
          ...prev,
          stage: 'ready',
          sheets: infos,
          selected: new Set(infos.filter((s) => !s.hidden && !s.skippedReason).map((s) => s.id)),
          warnings: wb.warnings,
        }));
      } catch (e) {
        if (job !== jobRef.current) return;
        if (controller.signal.aborted) {
          setState((prev) => ({ ...initialState, settings: prev.settings }));
          return;
        }
        const message = e instanceof ConversionError ? e.message : 'The file could not be read.';
        setState((prev) => ({ ...initialState, settings: prev.settings, error: message }));
      }
    },
    [dropResult]
  );

  const invalidate = useCallback(
    (prev: ExcelToPdfState): Pick<ExcelToPdfState, 'stage' | 'result' | 'error'> => {
      dropResult();
      return { stage: prev.stage === 'done' ? 'ready' : prev.stage, result: null, error: null };
    },
    [dropResult]
  );

  const toggleSheet = useCallback(
    (id: number) => {
      setState((prev) => {
        const next = new Set(prev.selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return { ...prev, ...invalidate(prev), selected: next };
      });
    },
    [invalidate]
  );

  const selectAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      ...invalidate(prev),
      selected: new Set(
        prev.sheets
          .filter((s) => !s.skippedReason && (!s.hidden || prev.settings.includeHiddenSheets))
          .map((s) => s.id)
      ),
    }));
  }, [invalidate]);

  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, ...invalidate(prev), selected: new Set() }));
  }, [invalidate]);

  const updateSettings = useCallback(
    (patch: Partial<ConversionSettings>) => {
      setState((prev) => {
        const settings = { ...prev.settings, ...patch };
        let selected = prev.selected;
        if (patch.includeHiddenSheets === false) {
          const hiddenIds = new Set(prev.sheets.filter((s) => s.hidden).map((s) => s.id));
          selected = new Set([...prev.selected].filter((id) => !hiddenIds.has(id)));
        }
        return { ...prev, ...invalidate(prev), settings, selected };
      });
    },
    [invalidate]
  );

  const convert = useCallback(async () => {
    const wb = workbookRef.current;
    if (!wb) return;
    if (state.selected.size === 0) {
      setState((prev) => ({ ...prev, error: 'Select at least one worksheet to convert.' }));
      return;
    }

    dropResult();
    const job = ++jobRef.current;
    const controller = new AbortController();
    abortRef.current = controller;

    setState((prev) => ({
      ...prev,
      stage: 'converting',
      error: null,
      result: null,
      progress: { message: 'Starting', percent: 0 },
    }));

    try {
      const { generatePdf } = await import('./excel-to-pdf-generator');
      const res = await generatePdf(
        wb,
        [...state.selected],
        state.settings,
        (p) => {
          if (job === jobRef.current) setState((prev) => ({ ...prev, progress: p }));
        },
        controller.signal
      );
      if (job !== jobRef.current) return;

      const url = URL.createObjectURL(res.blob);
      urlRef.current = url;
      setState((prev) => ({
        ...prev,
        stage: 'done',
        progress: null,
        result: {
          url,
          pageCount: res.pageCount,
          pageSheets: res.pageSheets,
          size: res.blob.size,
          warnings: res.warnings,
        },
      }));
    } catch (e) {
      if (job !== jobRef.current) return;
      if (controller.signal.aborted) {
        setState((prev) => ({ ...prev, stage: 'ready', progress: null }));
        return;
      }
      const message =
        e instanceof ConversionError ? e.message : 'The PDF could not be created. The workbook may be too complex or too large.';
      setState((prev) => ({ ...prev, stage: 'ready', progress: null, error: message }));
    }
  }, [state.selected, state.settings, dropResult]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    state,
    actions: { selectFile, toggleSheet, selectAll, clearSelection, updateSettings, convert, cancel, reset },
  };
}