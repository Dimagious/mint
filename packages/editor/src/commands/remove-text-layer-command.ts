import type { EditorDocument, TextLayerData } from '@social-posts-helper/core';
import type { Command } from './command';

export class RemoveTextLayerCommand implements Command {
  readonly description = 'Remove text layer';
  private readonly layerId: string;
  private removedLayer: TextLayerData | null = null;
  private removedIndex = -1;

  constructor(layerId: string) {
    this.layerId = layerId;
  }

  execute(doc: EditorDocument): EditorDocument {
    const idx = doc.layers.findIndex((l) => l.id === this.layerId);
    if (idx === -1) return doc;
    this.removedLayer = doc.layers[idx] ?? null;
    this.removedIndex = idx;
    return {
      ...doc,
      layers: doc.layers.filter((l) => l.id !== this.layerId),
    };
  }

  undo(doc: EditorDocument): EditorDocument {
    if (!this.removedLayer) return doc;
    const layers = [...doc.layers];
    layers.splice(this.removedIndex, 0, this.removedLayer);
    return { ...doc, layers };
  }
}
