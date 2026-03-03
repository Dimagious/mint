import type { EditorDocument } from '@social-posts-helper/core';
import type { Command } from './command';

export class ReorderLayerCommand implements Command {
  readonly description = 'Reorder layer';
  private readonly layerId: string;
  private readonly direction: 'up' | 'down';
  private previousIndex = -1;

  constructor(layerId: string, direction: 'up' | 'down') {
    this.layerId = layerId;
    this.direction = direction;
  }

  execute(doc: EditorDocument): EditorDocument {
    const layers = [...doc.layers];
    const idx = layers.findIndex((l) => l.id === this.layerId);
    if (idx === -1) return doc;

    this.previousIndex = idx;
    const newIdx = this.direction === 'up' ? idx + 1 : idx - 1;
    if (newIdx < 0 || newIdx >= layers.length) return doc;

    const item = layers[idx];
    if (!item) return doc;
    layers.splice(idx, 1);
    layers.splice(newIdx, 0, item);

    return { ...doc, layers };
  }

  undo(doc: EditorDocument): EditorDocument {
    if (this.previousIndex === -1) return doc;
    const layers = [...doc.layers];
    const currentIdx = layers.findIndex((l) => l.id === this.layerId);
    if (currentIdx === -1) return doc;

    const item = layers[currentIdx];
    if (!item) return doc;
    layers.splice(currentIdx, 1);
    layers.splice(this.previousIndex, 0, item);

    return { ...doc, layers };
  }
}
