import type { EditorDocument } from '@social-posts-helper/core';
import type { Command } from './command';

export class CommandHistory {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];

  execute(command: Command, doc: EditorDocument): EditorDocument {
    const newDoc = command.execute(doc);
    this.undoStack.push(command);
    this.redoStack = [];
    return newDoc;
  }

  undo(doc: EditorDocument): EditorDocument {
    const command = this.undoStack.pop();
    if (!command) return doc;
    const newDoc = command.undo(doc);
    this.redoStack.push(command);
    return newDoc;
  }

  redo(doc: EditorDocument): EditorDocument {
    const command = this.redoStack.pop();
    if (!command) return doc;
    const newDoc = command.execute(doc);
    this.undoStack.push(command);
    return newDoc;
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
