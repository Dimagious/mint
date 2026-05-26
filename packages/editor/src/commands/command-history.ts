import type { EditorDocument } from '@mint/core';
import type { Command } from './command';

/**
 * Default upper bound on the number of commands kept in the undo stack.
 *
 * Each command keeps a snapshot of the part of the document it changed;
 * `SetBackgroundCommand` in particular holds base64-encoded image data
 * inside its closure. Without a cap the history grows unbounded as the
 * user iterates on a design — a few backgrounds plus a long edit session
 * was enough to OOM the tab. 100 entries is plenty for a real editing
 * session and bounds RAM at a few MB even with multiple bg swaps.
 */
const DEFAULT_HISTORY_CAP = 100;

export interface CommandHistoryOptions {
  /** Max entries in the undo stack. Defaults to 100. */
  cap?: number;
  /** Wall-clock source — overridable for tests. */
  now?: () => number;
}

interface UndoEntry {
  command: Command;
  /** Wall-clock millis the entry was last touched (push OR successful coalesce). */
  touchedAt: number;
}

export class CommandHistory {
  private undoStack: UndoEntry[] = [];
  private redoStack: UndoEntry[] = [];
  private readonly cap: number;
  private readonly now: () => number;

  constructor(options: CommandHistoryOptions = {}) {
    this.cap = options.cap ?? DEFAULT_HISTORY_CAP;
    this.now = options.now ?? (() => Date.now());
  }

  execute(command: Command, doc: EditorDocument): EditorDocument {
    const newDoc = command.execute(doc);
    const now = this.now();

    // Try to merge with the most recent command (e.g. multiple slider ticks
    // on the same field within ~300 ms become one undo entry).
    const top = this.undoStack[this.undoStack.length - 1];
    if (top && top.command.tryCoalesce?.(command, now - top.touchedAt)) {
      top.touchedAt = now;
      this.redoStack = [];
      return newDoc;
    }

    this.undoStack.push({ command, touchedAt: now });
    // FIFO drop the oldest entry once the cap is hit.
    if (this.undoStack.length > this.cap) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    return newDoc;
  }

  undo(doc: EditorDocument): EditorDocument {
    const entry = this.undoStack.pop();
    if (!entry) return doc;
    const newDoc = entry.command.undo(doc);
    this.redoStack.push(entry);
    return newDoc;
  }

  redo(doc: EditorDocument): EditorDocument {
    const entry = this.redoStack.pop();
    if (!entry) return doc;
    const newDoc = entry.command.execute(doc);
    // Treat redo as a fresh touch — a follow-up edit shouldn't try to
    // coalesce with a command whose original push was far in the past.
    entry.touchedAt = this.now();
    this.undoStack.push(entry);
    return newDoc;
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /** Exposed for assertions in tests. */
  get size(): number {
    return this.undoStack.length;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
