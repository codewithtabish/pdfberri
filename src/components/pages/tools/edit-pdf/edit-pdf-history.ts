// src/components/pages/tools/edit-pdf/edit-pdf-history.ts
import type { HistoryEntry } from './edit-pdf-types';
import { EDIT_PDF_CONFIG } from './edit-pdf-constants';

export class HistoryStack {
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];

  push(entry: HistoryEntry) {
    this.undoStack.push(entry);
    if (this.undoStack.length > EDIT_PDF_CONFIG.maxHistoryEntries) this.undoStack.shift();
    this.redoStack = [];
  }
  undo(): boolean {
    const e = this.undoStack.pop();
    if (!e) return false;
    e.undo();
    this.redoStack.push(e);
    return true;
  }
  redo(): boolean {
    const e = this.redoStack.pop();
    if (!e) return false;
    e.redo();
    this.undoStack.push(e);
    return true;
  }
  canUndo() { return this.undoStack.length > 0; }
  canRedo() { return this.redoStack.length > 0; }
  clear() { this.undoStack = []; this.redoStack = []; }
}