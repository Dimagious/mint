import type { EditorDocument } from '@social-posts-helper/core';
import type { CanvasPresetId } from '@social-posts-helper/core';
import type { Command } from './command';

export class ChangePresetCommand implements Command {
  readonly description = 'Change canvas preset';
  private readonly newPresetId: CanvasPresetId;
  private previousPresetId: CanvasPresetId | null = null;

  constructor(newPresetId: CanvasPresetId) {
    this.newPresetId = newPresetId;
  }

  execute(doc: EditorDocument): EditorDocument {
    this.previousPresetId = doc.presetId;
    return { ...doc, presetId: this.newPresetId };
  }

  undo(doc: EditorDocument): EditorDocument {
    if (!this.previousPresetId) return doc;
    return { ...doc, presetId: this.previousPresetId };
  }
}
