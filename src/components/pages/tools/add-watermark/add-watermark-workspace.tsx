'use client';
import React, { useState } from 'react';
import { useAddWatermark } from './use-add-watermark';
import { AddWatermarkUpload } from './add-watermark-upload';
import { AddWatermarkFileInfo } from './add-watermark-file-info';
import { AddWatermarkTypeSelector } from './add-watermark-type-selector';
import { AddWatermarkTextSettings } from './add-watermark-text-settings';
import { AddWatermarkImageSettings } from './add-watermark-image-settings';
import { AddWatermarkAppearance } from './add-watermark-appearance';
import { AddWatermarkPosition } from './add-watermark-position';
import { AddWatermarkPageRange } from './add-watermark-page-range';
import { AddWatermarkPreview } from './add-watermark-preview';
import { AddWatermarkPreviewToolbar } from './add-watermark-preview-toolbar';
import { AddWatermarkProgress } from './add-watermark-progress';
import { AddWatermarkResult } from './add-watermark-result';
import { AddWatermarkError } from './add-watermark-error';

export function AddWatermarkWorkspace() {
  const { doc, config, setConfig, status, error, output, progress, loadFile, loadImage, generate, download, reset } = useAddWatermark();
  const [previewPage, setPreviewPage] = useState(1);

  if (status === 'idle' || (status === 'loading' && !doc)) return <AddWatermarkUpload onFile={loadFile} isLoading={status === 'loading'} error={error} />;
  if (status === 'error' && !doc) return <AddWatermarkError message={error!} onRetry={reset} />;
  if (status === 'processing') return <AddWatermarkProgress message={progress} />;
  if (status === 'success' && output) return <AddWatermarkResult output={output} onDownload={download} onReset={reset} />;

  return (
    <div className="flex flex-col gap-6">
      <AddWatermarkFileInfo filename={doc!.filename} pageCount={doc!.pageCount} onRemove={reset} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Panel */}
        <div className="flex flex-col gap-6">
          <AddWatermarkTypeSelector type={config.type} onChange={(type) => setConfig({ ...config, type })} />
          
          {config.type === 'text' ? (
            <AddWatermarkTextSettings config={config} onChange={setConfig} />
          ) : (
            <AddWatermarkImageSettings config={config} onImageLoad={loadImage} />
          )}

          <AddWatermarkAppearance config={config} onChange={setConfig} />
          <AddWatermarkPosition position={config.position} onChange={(position) => setConfig({ ...config, position })} />
          <AddWatermarkPageRange pageRange={config.pageRange} customRange={config.customRange} onChange={(patch) => setConfig({ ...config, ...patch })} />

          {/* FIXED: Removed the impossible status check */}
          <button onClick={generate} className="mt-4 w-full bg-primary text-primary-foreground py-3 rounded font-medium">
            Add Watermark
          </button>
          
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        {/* Preview Panel */}
        <div className="flex flex-col items-center">
          <AddWatermarkPreview bytes={doc!.bytes} pageNumber={previewPage} config={config} zoom={1} />
          <AddWatermarkPreviewToolbar current={previewPage} total={doc!.pageCount} onPrev={() => setPreviewPage(p => p - 1)} onNext={() => setPreviewPage(p => p + 1)} />
        </div>
      </div>
    </div>
  );
}