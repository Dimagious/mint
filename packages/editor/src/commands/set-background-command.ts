import type { EditorDocument, BackgroundData } from '@social-posts-helper/core';
import type { Command } from './command';

export class SetBackgroundCommand implements Command {
  readonly description = 'Set background';
  private readonly newBackground: BackgroundData;
  private previousBackground: BackgroundData | null = null;

  constructor(newBackground: BackgroundData) {
    this.newBackground = newBackground;
  }

  execute(doc: EditorDocument): EditorDocument {
    this.previousBackground = doc.background;
    return { ...doc, background: this.newBackground };
  }

  undo(doc: EditorDocument): EditorDocument {
    if (!this.previousBackground) return doc;
    return { ...doc, background: this.previousBackground };
  }
}
