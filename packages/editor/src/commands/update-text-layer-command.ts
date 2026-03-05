import type { EditorDocument, TextLayerData } from '@mint/core';
import type { Command } from './command';

export class UpdateTextLayerCommand implements Command {
  readonly description = 'Update text layer';
  private readonly layerId: string;
  private readonly changes: Partial<Omit<TextLayerData, 'id'>>;
  private previousState: TextLayerData | null = null;

  constructor(layerId: string, changes: Partial<Omit<TextLayerData, 'id'>>) {
    this.layerId = layerId;
    this.changes = changes;
  }

  execute(doc: EditorDocument): EditorDocument {
    return {
      ...doc,
      layers: doc.layers.map((l) => {
        if (l.id !== this.layerId) return l;
        this.previousState = l;
        return { ...l, ...this.changes };
      }),
    };
  }

  undo(doc: EditorDocument): EditorDocument {
    if (!this.previousState) return doc;
    const prev = this.previousState;
    return {
      ...doc,
      layers: doc.layers.map((l) => (l.id === this.layerId ? prev : l)),
    };
  }
}
