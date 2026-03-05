import type { EditorDocument } from '@mint/core';

export interface Command {
  execute(doc: EditorDocument): EditorDocument;
  undo(doc: EditorDocument): EditorDocument;
  readonly description: string;
}
