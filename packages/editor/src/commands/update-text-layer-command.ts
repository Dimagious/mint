import type { EditorDocument, TextLayerData } from '@mint/core';
import type { Command } from './command';

/**
 * Time window (ms) inside which two consecutive updates on the same layer
 * are merged into a single undo entry.
 *
 * Long enough to absorb a slider drag (which fires onChange continuously)
 * or a fast sequence of arrow-key nudges; short enough that two
 * deliberate edits a second apart stay as separate undo entries.
 */
const COALESCE_WINDOW_MS = 300;

export class UpdateTextLayerCommand implements Command {
  readonly description = 'Update text layer';
  private readonly layerId: string;
  private changes: Partial<Omit<TextLayerData, 'id'>>;
  private previousState: TextLayerData | null = null;

  constructor(layerId: string, changes: Partial<Omit<TextLayerData, 'id'>>) {
    this.layerId = layerId;
    this.changes = changes;
  }

  execute(doc: EditorDocument): EditorDocument {
    // Snapshot the pre-execute layer state only on the first run. Later runs
    // (notably `history.redo` → `command.execute`) read the doc after it was
    // undone, so re-snapshotting would either be a no-op or, if the snapshot
    // ever desynced from the doc the command was originally pushed against,
    // mask a bug. Snapshot-once keeps undo monotonic.
    if (this.previousState === null) {
      const layer = doc.layers.find((l) => l.id === this.layerId);
      if (layer) this.previousState = layer;
    }
    return {
      ...doc,
      layers: doc.layers.map((l) =>
        l.id === this.layerId ? { ...l, ...this.changes } : l,
      ),
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

  /**
   * Coalesce a follow-up update on the same layer within the window.
   *
   * When the user drags a slider, MUI emits one onChange per pixel — without
   * coalescing each tick would land as a separate undo entry. By merging
   * the newer command's changes into this one (and keeping `previousState`
   * untouched), the entire gesture becomes a single undo.
   */
  tryCoalesce(next: Command, elapsedMs: number): boolean {
    if (!(next instanceof UpdateTextLayerCommand)) return false;
    if (next.layerId !== this.layerId) return false;
    if (elapsedMs > COALESCE_WINDOW_MS) return false;
    // Deep-merge `style` so a font-size tick doesn't drop a previous color tick.
    const incomingStyle = next.changes.style;
    const currentStyle = this.changes.style;
    this.changes = {
      ...this.changes,
      ...next.changes,
      ...(incomingStyle && currentStyle
        ? { style: { ...currentStyle, ...incomingStyle } }
        : {}),
    };
    return true;
  }
}
