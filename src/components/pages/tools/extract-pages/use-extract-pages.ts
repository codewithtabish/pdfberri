'use client';
import { useState, useCallback } from 'react';
import { validatePdfFile } from './extract-pages-file-utils';
import { loadPdfMetadata } from './extract-pages-loader';
import { generateExtractedPdf } from './extract-pages-engine';
import { validateSelection } from './extract-pages-validator';
import { togglePageSelection, selectAllPages, invertSelection } from './extract-pages-selection-manager';
import type { DocumentState, ProcessingStatus, OutputMode, OutputState } from './extract-pages-types';
import { parsePageRange } from './extract-pages-range-parser';

export function useExtractPages() {
  const [doc, setDoc] = useState<DocumentState | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<OutputState[] | null>(null);
  const [mode, setMode] = useState<OutputMode>('combined');

  const loadFile = useCallback(async (file: File) => {
    setStatus('loading'); setError(null); setOutput(null); setSelectedIndices([]);
    try {
      const v = validatePdfFile(file);
      if (v) throw new Error(v);
      const arrayBuffer = await file.arrayBuffer();
      const { pageCount } = await loadPdfMetadata(arrayBuffer);
      setDoc({ file, filename: file.name, fileSize: file.size, pageCount, bytes: arrayBuffer });
      setStatus('ready');
    } catch (err: any) {
      setStatus('error'); setError(err.message || 'Failed to load PDF.'); setDoc(null);
    }
  }, []);

  const togglePage = useCallback((index: number) => {
    setSelectedIndices(prev => togglePageSelection(prev, index));
  }, []);

  const setRange = useCallback((rangeStr: string) => {
    if (!doc) return;
    try {
      // Parser returns 0-based indices
      const indices = parsePageRange(rangeStr, doc.pageCount);
      setSelectedIndices(indices); setError(null);
    } catch (err: any) { setError(err.message); }
  }, [doc]);

  const selectAll = useCallback(() => {
    if (doc) setSelectedIndices(selectAllPages(doc.pageCount));
  }, [doc]);

  const clearAll = useCallback(() => setSelectedIndices([]), []);

  const invert = useCallback(() => {
    if (doc) setSelectedIndices(prev => invertSelection(prev, doc.pageCount));
  }, [doc]);

  const processExtraction = useCallback(async () => {
    if (!doc) return;
    const v = validateSelection(selectedIndices, doc.pageCount);
    if (v) { setError(v); return; }

    setStatus('processing'); setError(null);
    try {
      const files = await generateExtractedPdf(doc.bytes, selectedIndices, mode);
      setOutput(files.map((f, i) => ({
        blob: f.blob,
        filename: mode === 'combined' ? f.filename : f.filename.replace('.pdf', `-${i}.pdf`),
        size: f.blob.size
      })));
      setStatus('success');
    } catch (err: any) {
      setError('Failed to extract pages.'); setStatus('error');
    }
  }, [doc, selectedIndices, mode]);

  const reset = useCallback(() => {
    setDoc(null); setOutput(null); setError(null); setStatus('idle'); setSelectedIndices([]);
  }, []);

  return { doc, selectedIndices, status, error, output, mode, setMode, loadFile, togglePage, setRange, selectAll, clearAll, invert, processExtraction, reset };
}