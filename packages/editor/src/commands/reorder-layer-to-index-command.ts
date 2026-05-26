import type { EditorDocument } from '@mint/core';
import type { Command } from './command';

/**
 * Moves a layer to an absolute index inside `doc.layers`. Used by the
 * drag-and-drop reorder path in the Layers panel.
 *
 * The incremental `ReorderLayerCommand` (up/down) is kept as a fallback
 * for menu actions; this command covers multi-position moves in one step
 * so undo/redo history doesn't get N entries per drag.
 */
export class ReorderLayerToIndexCommand implements Command {
  readonly description = 'Reorder layer';
  private readonly layerId: string;
  private readonly newIndex: number;
  private previousIndex = -1;

  constructor(layerId: string, newIndex: number) {
    this.layerId = layerId;
    this.newIndex = newIndex;
  }

  execute(doc: EditorDocument): EditorDocument {
    const layers = [...doc.layers];
    const fromIdx = layers.findIndex((l) => l.id === this.layerId);
    if (fromIdx === -1) return doc;

    const clampedTo = Math.max(0, Math.min(layers.length - 1, this.newIndex));
    if (clampedTo === fromIdx) return doc;

    this.previousIndex = fromIdx;
    const item = layers[fromIdx];
    if (!item) return doc;
    layers.splice(fromIdx, 1);
    layers.splice(clampedTo, 0, item);
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
