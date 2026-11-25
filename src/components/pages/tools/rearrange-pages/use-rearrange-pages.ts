'use client';
import { useState, useCallback, useRef } from 'react';
import { validatePdfFile } from './rearrange-pages-validation';
import { loadPdfMetadata } from './rearrange-pages-loader';
import { generateRearrangedPdf } from './rearrange-pages-engine';
import { HistoryStack } from './rearrange-pages-history';
import { arrayMove, generateId } from './rearrange-pages-utils';
import type { DocumentState, PageItem, ProcessingStatus, OutputState } from './rearrange-pages-types';

export function useRearrangePages() {
  const [doc, setDoc] = useState<DocumentState | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<OutputState | null>(null);
  
  const historyRef = useRef(new HistoryStack());
  const [historyVersion, setHistoryVersion] = useState(0); // Force re-render for undo/redo buttons

  const loadFile = useCallback(async (file: File) => {
    setStatus('loading'); setError(null); setOutput(null); setSelectedIds([]);
    historyRef.current.clear();
    try {
      const v = validatePdfFile(file);
      if (v) throw new Error(v);
      const arrayBuffer = await file.arrayBuffer();
      const { pageCount } = await loadPdfMetadata(arrayBuffer);
      
      const initialPages = Array.from({ length: pageCount }, (_, i) => ({
        id: generateId(),
        originalIndex: i
      }));

      setDoc({ file, filename: file.name, fileSize: file.size, pageCount, bytes: arrayBuffer });
      setPages(initialPages);
      setStatus('ready');
    } catch (err: any) {
      setStatus('error'); setError(err.message || 'Failed to load PDF.'); setDoc(null);
    }
  }, []);

  const movePage = useCallback((fromIndex: number, toIndex: number) => {
    setPages(prev => {
      historyRef.current.push([...prev]);
      setHistoryVersion(v => v + 1);
      return arrayMove(prev, fromIndex, toIndex);
    });
  }, []);

  const toggleSelect = useCallback((id: string, multi: boolean) => {
    if (multi) {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else {
      setSelectedIds(prev => prev.includes(id) && prev.length === 1 ? [] : [id]);
    }
  }, []);

  const selectAll = () => setSelectedIds(pages.map(p => p.id));
  const clearSelection = () => setSelectedIds([]);

  const reverseOrder = () => {
    setPages(prev => {
      historyRef.current.push([...prev]);
      setHistoryVersion(v => v + 1);
      return [...prev].reverse();
    });
  };

  const undo = () => {
    const prev = historyRef.current.undo([...pages]);
    if (prev) { setPages(prev); setHistoryVersion(v => v + 1); }
  };

  const redo = () => {
    const next = historyRef.current.redo([...pages]);
    if (next) { setPages(next); setHistoryVersion(v => v + 1); }
  };

  const processRearrangement = useCallback(async () => {
    if (!doc) return;
    setStatus('processing'); setError(null);
    try {
      const orderedIndices = pages.map(p => p.originalIndex);
      const bytes = await generateRearrangedPdf(doc.bytes, orderedIndices);
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      
      setOutput({
        blob,
        filename: doc.filename.replace('.pdf', '-rearranged.pdf'),
        size: blob.size
      });
      setStatus('success');
    } catch (err: any) {
      setError('Failed to rearrange pages.'); setStatus('error');
    }
  }, [doc, pages]);

  const reset = () => {
    setDoc(null); setPages([]); setSelectedIds([]); setOutput(null); setError(null); setStatus('idle');
    historyRef.current.clear();
  };

  return {
    doc, pages, selectedIds, status, error, output,
    loadFile, movePage, toggleSelect, selectAll, clearSelection, reverseOrder,
    undo, redo, processRearrangement, reset,
    canUndo: historyRef.current.canUndo(), canRedo: historyRef.current.canRedo(),
    historyVersion
  };
}