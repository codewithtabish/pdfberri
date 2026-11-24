'use client';

import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { parsePageRange } from './add-page-numbers-range';
import { DEFAULT_CONFIG, MAX_FILE_SIZE_BYTES } from './add-page-numbers-constants';
import type { DocumentState, NumberingConfig, OutputState, ProcessingStatus } from './add-page-numbers-types';

export function useAddPageNumbers() {
  const [doc, setDoc] = useState<DocumentState | null>(null);
  const [config, setConfig] = useState<NumberingConfig>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<OutputState | null>(null);
  const [progress, setProgress] = useState<string>('');

  const loadFile = useCallback(async (file: File) => {
    setStatus('loading');
    setError(null);
    setOutput(null);

    try {
      if (!file.name.toLowerCase().endsWith('.pdf')) throw new Error('Please select a valid PDF file.');
      if (file.size > MAX_FILE_SIZE_BYTES) throw new Error(`File exceeds ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB limit.`);

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
      const pageCount = pdfDoc.getPageCount();

      setDoc({ file, filename: file.name, fileSize: file.size, pageCount, bytes: arrayBuffer });
      setStatus('ready');
    } catch (err: any) {
      setStatus('error');
      setError(err.message.includes('encrypted') ? 'This PDF is password-protected.' : 'Failed to load PDF.');
      setDoc(null);
    }
  }, []);

  const generate = useCallback(async () => {
    if (!doc) return;
    setStatus('processing');
    setError(null);
    setProgress('Preparing...');

    try {
      let selectedPages: number[] = [];
      if (config.rangeType === 'all') {
        selectedPages = Array.from({ length: doc.pageCount }, (_, i) => i);
      } else {
        selectedPages = parsePageRange(config.customRange, doc.pageCount);
        if (selectedPages.length === 0) throw new Error('Custom range resulted in no pages.');
      }

      const worker = new Worker(new URL('./add-page-numbers-worker.ts', import.meta.url));

      worker.onmessage = (e) => {
        const { type, bytes, message } = e.data;
        
        if (type === 'PROGRESS') {
          setProgress(message);
        } else if (type === 'SUCCESS') {
          const blob = new Blob([bytes], { type: 'application/pdf' });
          setOutput({
            blob,
            filename: doc.filename.replace(/\.pdf$/i, '-numbered.pdf'),
            size: blob.size,
            pageCount: doc.pageCount,
          });
          setStatus('success');
          worker.terminate();
        } else if (type === 'ERROR') {
          setError(message);
          setStatus('error');
          worker.terminate();
        }
      };

      worker.onerror = () => {
        setError('Worker execution failed.');
        setStatus('error');
        worker.terminate();
      };

      const bytesCopy = doc.bytes.slice(0);
      worker.postMessage({ originalBytes: bytesCopy, config, selectedPages }, [bytesCopy]);
    } catch (err: any) {
      setError(err.message || 'Failed to generate PDF.');
      setStatus('error');
    }
  }, [doc, config]);

  const download = useCallback(() => {
    if (!output) return;
    const url = URL.createObjectURL(output.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = output.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [output]);

  const reset = useCallback(() => {
    setDoc(null);
    setOutput(null);
    setError(null);
    setStatus('idle');
    setConfig(DEFAULT_CONFIG);
  }, []);

  return { doc, config, setConfig, status, error, output, progress, loadFile, generate, download, reset };
}