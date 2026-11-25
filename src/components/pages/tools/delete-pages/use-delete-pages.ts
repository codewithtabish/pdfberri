'use client';
import { useState, useCallback } from 'react';
import { validatePdfFile } from './delete-pages-file-utils';
import { loadPdfMetadata } from './delete-pages-loader';
import { generateDeletedPdf } from './delete-pages-engine';
import { validateSelection } from './delete-pages-validator';
import { togglePageSelection, selectAllPages, invertSelection } from './delete-pages-selection-manager';
import { getRemainingIndices } from './delete-pages-page-mapping';
import { getDeletedFilename } from './delete-pages-filename';
import { parsePageRange } from './delete-pages-range-parser';
import type { DocumentState, ProcessingStatus, OutputState } from './delete-pages-types';

export function useDeletePages() {
  const [doc, setDoc] = useState<DocumentState | null>(null);
  const [deletedIndices, setDeletedIndices] = useState<number[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<OutputState | null>(null);

  const loadFile = useCallback(async (file: File) => {
    setStatus('loading'); setError(null); setOutput(null); setDeletedIndices([]);
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
    setDeletedIndices(prev => togglePageSelection(prev, index));
  }, []);

  const setRange = useCallback((rangeStr: string) => {
    if (!doc) return;
    try {
      const indices = parsePageRange(rangeStr, doc.pageCount);
      setDeletedIndices(indices); setError(null);
    } catch (err: any) { setError(err.message); }
  }, [doc]);

  const selectAll = useCallback(() => {
    if (doc) setDeletedIndices(selectAllPages(doc.pageCount));
  }, [doc]);

  const clearAll = useCallback(() => setDeletedIndices([]), []);

  const invert = useCallback(() => {
    if (doc) setDeletedIndices(prev => invertSelection(prev, doc.pageCount));
  }, [doc]);

  const promptConfirmation = useCallback(() => {
    if (!doc) return;
    const v = validateSelection(deletedIndices, doc.pageCount);
    if (v) { setError(v); return; }
    setStatus('confirming'); setError(null);
  }, [doc, deletedIndices]);

  const cancelConfirmation = useCallback(() => {
    setStatus('ready');
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!doc) return;
    setStatus('processing'); setError(null);
    try {
      const remaining = getRemainingIndices(doc.pageCount, deletedIndices);
      const bytes = await generateDeletedPdf(doc.bytes, remaining);
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      
      setOutput({
        blob,
        filename: getDeletedFilename(doc.filename),
        size: blob.size,
        originalCount: doc.pageCount,
        deletedCount: deletedIndices.length,
        remainingCount: remaining.length
      });
      setStatus('success');
    } catch (err: any) {
      setError('Failed to delete pages.'); setStatus('error');
    }
  }, [doc, deletedIndices]);

  const reset = useCallback(() => {
    setDoc(null); setOutput(null); setError(null); setStatus('idle'); setDeletedIndices([]);
  }, []);

  return { 
    doc, deletedIndices, status, error, output, 
    loadFile, togglePage, setRange, selectAll, clearAll, invert, 
    promptConfirmation, cancelConfirmation, confirmDelete, reset 
  };
}