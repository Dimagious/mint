import type { EditorDocument, TextLayerData } from '@mint/core';
import type { Command } from './command';

export class AddTextLayerCommand implements Command {
  readonly description = 'Add text layer';
  private readonly layer: TextLayerData;

  constructor(layer: TextLayerData) {
    this.layer = layer;
  }

  execute(doc: EditorDocument): EditorDocument {
    return { ...doc, layers: [...doc.layers, this.layer] };
  }

  undo(doc: EditorDocument): EditorDocument {
    return {
      ...doc,
      layers: doc.layers.filter((l) => l.id !== this.layer.id),
    };
  }
}
