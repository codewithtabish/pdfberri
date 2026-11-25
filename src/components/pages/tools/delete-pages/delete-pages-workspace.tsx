'use client';
import React, { useState } from 'react';
import { useDeletePages } from './use-delete-pages';
import { DeletePagesUpload } from './delete-pages-upload';
import { DeletePagesFileInfo } from './delete-pages-file-info';
import { DeletePagesToolbar } from './delete-pages-toolbar';
import { DeletePagesThumbnailGrid } from './delete-pages-thumbnail-grid';
import { DeletePagesConfirmation } from './delete-pages-confirmation';
import { DeletePagesResult } from './delete-pages-result';

export function DeletePagesWorkspace() {
  const { 
    doc, deletedIndices, status, error, output, 
    loadFile, togglePage, setRange, selectAll, clearAll, invert, 
    promptConfirmation, cancelConfirmation, confirmDelete, reset 
  } = useDeletePages();

  if (!doc || status === 'idle' || status === 'loading') return <DeletePagesUpload onFile={loadFile} isLoading={status === 'loading'} error={error} />;
  if (status === 'success' && output) return <DeletePagesResult output={output} onReset={reset} />;

  const remaining = doc.pageCount - deletedIndices.length;

  return (
    <div className="flex flex-col gap-6 relative">
      <DeletePagesFileInfo filename={doc.filename} fileSize={doc.fileSize} pageCount={doc.pageCount} onReset={reset} />
      
      <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm font-medium flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        Select the pages you want to remove.
      </div>

      <DeletePagesToolbar 
        selectedCount={deletedIndices.length} total={doc.pageCount} 
        onSelectAll={selectAll} onClear={clearAll} onInvert={invert} onRangeChange={setRange} 
      />

      <div className="flex items-center gap-4 text-sm font-medium">
        <span className="text-red-600 bg-red-50 px-3 py-1.5 rounded-full">{deletedIndices.length} pages selected for deletion</span>
        <span className="text-green-600 bg-green-50 px-3 py-1.5 rounded-full">{remaining} pages will remain</span>
      </div>

      <DeletePagesThumbnailGrid bytes={doc.bytes} pageCount={doc.pageCount} deletedIndices={deletedIndices} onToggle={togglePage} />

      <div className="sticky bottom-4 flex items-center justify-between rounded-xl border bg-card p-4 shadow-lg mt-4">
        <p className="text-sm text-muted-foreground">Ensure at least one page remains.</p>
        <button 
          onClick={promptConfirmation} 
          disabled={deletedIndices.length === 0 || deletedIndices.length >= doc.pageCount || status === 'processing'} 
          className="rounded bg-red-600 px-8 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          Delete Pages
        </button>
      </div>

      {status === 'confirming' && (
        <DeletePagesConfirmation 
          deletedCount={deletedIndices.length} 
          remainingCount={remaining} 
          onCancel={cancelConfirmation} 
          onConfirm={confirmDelete}
          isProcessing={false}
        />
      )}

      {error && <p className="text-sm text-destructive text-center">{error}</p>}
    </div>
  );
}