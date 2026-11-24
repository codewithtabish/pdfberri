// src/components/pages/tools/annotate-pdf/annotate-pdf-history.ts
import type { Annotation } from "./annotate-pdf-types";
import { HISTORY_LIMIT } from "./annotate-pdf-constants";

export type Snapshot = Annotation[];

export class AnnotationHistory {
  private undoStack: Snapshot[] = [];
  private redoStack: Snapshot[] = [];
  private current: Snapshot = [];

  reset(initial: Snapshot = []) {
    this.undoStack = [];
    this.redoStack = [];
    this.current = clone(initial);
  }

  push(next: Snapshot) {
    this.undoStack.push(this.current);
    if (this.undoStack.length > HISTORY_LIMIT) this.undoStack.shift();
    this.current = clone(next);
    this.redoStack = [];
  }

  replace(next: Snapshot) {
    // Replace without creating an undo entry (e.g. live drag)
    this.current = clone(next);
  }

  undo(): Snapshot | null {
    const prev = this.undoStack.pop();
    if (!prev) return null;
    this.redoStack.push(this.current);
    this.current = prev;
    return clone(this.current);
  }

  redo(): Snapshot | null {
    const next = this.redoStack.pop();
    if (!next) return null;
    this.undoStack.push(this.current);
    this.current = next;
    return clone(this.current);
  }

  get canUndo() { return this.undoStack.length > 0; }
  get canRedo() { return this.redoStack.length > 0; }
  get value(): Snapshot { return this.current; }
}

function clone<T>(v: T): T {
  return structuredClone(v);
}