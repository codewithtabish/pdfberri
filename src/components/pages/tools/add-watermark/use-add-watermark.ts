'use client';
import { useState, useCallback } from 'react';
import { loadPdfMetadata } from './add-watermark-pdf-loader';
import { parsePageRange } from './add-watermark-page-range-parser';
import { validateWatermarkConfig, validatePdfFile } from './add-watermark-validation';
import { createOutputBlob } from './add-watermark-export';
import { getWatermarkedFilename } from './add-watermark-filename';
import { DEFAULT_CONFIG } from './add-watermark-constants';
import type { DocumentState, WatermarkConfig, OutputState, ProcessingStatus } from './add-watermark-types';

export function useAddWatermark() {
  const [doc, setDoc] = useState<DocumentState | null>(null);
  const [config, setConfig] = useState<WatermarkConfig>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<OutputState | null>(null);
  const [progress, setProgress] = useState<string>('');

  const loadFile = useCallback(async (file: File) => {
    setStatus('loading');
    setError(null);
    setOutput(null);

    try {
      const validationError = await validatePdfFile(file);
      if (validationError) throw new Error(validationError);

      const arrayBuffer = await file.arrayBuffer();
      const { pageCount } = await loadPdfMetadata(arrayBuffer);

      setDoc({ file, filename: file.name, fileSize: file.size, pageCount, bytes: arrayBuffer });
      setStatus('ready');
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Failed to load PDF.');
      setDoc(null);
    }
  }, []);

  const loadImage = useCallback(async (file: File) => {
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setError('Only PNG and JPEG images are supported.');
      return;
    }
    const buffer = await file.arrayBuffer();
    setConfig(prev => ({
      ...prev,
      imageFile: file,
      imageBytes: buffer,
      imageType: file.type === 'image/png' ? 'png' : 'jpeg'
    }));
    setError(null);
  }, []);

  const generate = useCallback(async () => {
    if (!doc) return;
    
    const configError = validateWatermarkConfig(config);
    if (configError) {
      setError(configError);
      return;
    }

    setStatus('processing');
    setError(null);
    setProgress('Preparing...');

    try {
      let selectedPages: number[] = [];
      if (config.pageRange === 'all') {
        selectedPages = Array.from({ length: doc.pageCount }, (_, i) => i);
      } else {
        selectedPages = parsePageRange(config.customRange, doc.pageCount);
        if (selectedPages.length === 0) throw new Error('Custom range resulted in no pages.');
      }

      const worker = new Worker(new URL('./add-watermark-worker.ts', import.meta.url));

      worker.onmessage = (e) => {
        const { type, bytes, message } = e.data;
        if (type === 'PROGRESS') setProgress(message);
        else if (type === 'SUCCESS') {
          const blob = createOutputBlob(bytes);
          setOutput({
            blob,
            filename: getWatermarkedFilename(doc.filename),
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
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [output]);

  const reset = useCallback(() => {
    setDoc(null);
    setOutput(null);
    setError(null);
    setStatus('idle');
    setConfig(DEFAULT_CONFIG);
  }, []);

  return { doc, config, setConfig, status, error, output, progress, loadFile, loadImage, generate, download, reset };
}