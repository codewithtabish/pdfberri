'use client';
import React, { useState } from 'react';
import { useRearrangePages } from './use-rearrange-pages';
import { RearrangePagesThumbnail } from './rearrange-pages-thumbnail';
import { RearrangePagesToolbar } from './rearrange-pages-toolbar';

export function RearrangePagesWorkspace() {
  const { 
    doc, pages, selectedIds, status, error, output, 
    loadFile, movePage, toggleSelect, selectAll, clearSelection, reverseOrder,
    undo, redo, processRearrangement, reset, canUndo, canRedo
  } = useRearrangePages();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Create a custom ghost image
    const target = e.target as HTMLElement;
    e.dataTransfer.setDragImage(target, 50, 50);
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      movePage(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => setDraggedIndex(null);

  if (!doc || status === 'idle' || status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 bg-card/50">
        <h2 className="text-xl font-semibold mb-2">Select your PDF file</h2>
        <p className="text-sm text-muted-foreground mb-6">Drag and drop your PDF here or browse from your device.</p>
        <button onClick={() => document.getElementById('pdf-upload')?.click()} className="rounded bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90" disabled={status === 'loading'}>
          {status === 'loading' ? 'Loading...' : 'Browse PDF'}
        </button>
        <input id="pdf-upload" type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.length && loadFile(e.target.files[0])} />
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  if (status === 'success' && output) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-12 text-center">
        <h2 className="text-xl font-semibold mb-4">Pages Rearranged Successfully!</h2>
        <div className="flex gap-4 mt-4">
          <button onClick={() => { 
            const url = URL.createObjectURL(output.blob);
            const a = document.createElement('a'); a.href = url; a.download = output.filename; a.click();
          }} className="rounded bg-primary px-6 py-2.5 text-sm text-primary-foreground hover:bg-primary/90">Download PDF</button>
          <button onClick={reset} className="rounded border px-6 py-2.5 text-sm hover:bg-accent">Start Over</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between rounded-lg border bg-card p-4">
        <div>
          <p className="font-medium">{doc.filename}</p>
          <p className="text-xs text-muted-foreground">{doc.pageCount} pages</p>
        </div>
        <button onClick={reset} className="text-sm text-destructive hover:underline">Remove</button>
      </div>

      <RearrangePagesToolbar 
        selectedCount={selectedIds.length} 
        onSelectAll={selectAll} 
        onClear={clearSelection} 
        onReverse={reverseOrder}
        onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {pages.map((item, i) => (
          <RearrangePagesThumbnail 
            key={item.id} 
            item={item} 
            index={i} 
            bytes={doc.bytes} 
            isSelected={selectedIds.includes(item.id)}
            onToggleSelect={toggleSelect}
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

      <div className="sticky bottom-4 flex items-center justify-between rounded-xl border bg-card p-4 shadow-lg mt-4">
        <p className="text-sm font-medium">Ready to rearrange! {selectedIds.length > 0 ? `(${selectedIds.length} pages selected)` : ''}</p>
        <button onClick={processRearrangement} disabled={status === 'processing'} className="rounded bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {status === 'processing' ? 'Generating...' : 'Rearrange PDF'}
        </button>
      </div>
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
    </div>
  );
}