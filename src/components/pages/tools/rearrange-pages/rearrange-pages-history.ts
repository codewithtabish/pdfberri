import type { PageItem } from './rearrange-pages-types';

export class HistoryStack {
  private past: PageItem[][] = [];
  private future: PageItem[][] = [];

  push(state: PageItem[]) {
    this.past.push(state);
    this.future = [];
  }

  undo(currentState: PageItem[]): PageItem[] | null {
    const previous = this.past.pop();
    if (!previous) return null;
    this.future.push(currentState);
    return previous;
  }

  redo(currentState: PageItem[]): PageItem[] | null {
    const next = this.future.pop();
    if (!next) return null;
    this.past.push(currentState);
    return next;
  }

  clear() {
    this.past = [];
    this.future = [];
  }

  canUndo() { return this.past.length > 0; }
  canRedo() { return this.future.length > 0; }
}