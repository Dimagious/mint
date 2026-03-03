import type { EditorDocument } from '@social-posts-helper/core';

export interface Command {
  execute(doc: EditorDocument): EditorDocument;
  undo(doc: EditorDocument): EditorDocument;
  readonly description: string;
}
