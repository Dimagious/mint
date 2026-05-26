import { describe, it, expect } from 'vitest';
import { ReorderLayerToIndexCommand } from '../commands/reorder-layer-to-index-command';
import {
  createDefaultDocument,
  createTextLayer,
  type EditorDocument,
  type TextLayerData,
} from '@mint/core';

function makeDoc(...layers: TextLayerData[]): EditorDocument {
  return { ...createDefaultDocument(), layers };
}

describe('ReorderLayerToIndexCommand', () => {
  it('moves a layer from front to back of the stack', () => {
    const a = createTextLayer({ text: 'a' });
    const b = createTextLayer({ text: 'b' });
    const c = createTextLayer({ text: 'c' });
    const doc = makeDoc(a, b, c);

    const cmd = new ReorderLayerToIndexCommand(a.id, 2);
    const after = cmd.execute(doc);

    expect(after.layers.map((l) => l.text)).toEqual(['b', 'c', 'a']);
  });

  it('moves a layer multiple positions up', () => {
    const a = createTextLayer({ text: 'a' });
    const b = createTextLayer({ text: 'b' });
    const c = createTextLayer({ text: 'c' });
    const doc = makeDoc(a, b, c);

    const cmd = new ReorderLayerToIndexCommand(c.id, 0);
    const after = cmd.execute(doc);

    expect(after.layers.map((l) => l.text)).toEqual(['c', 'a', 'b']);
  });

  it('is a no-op when target index equals current index', () => {
    const a = createTextLayer({ text: 'a' });
    const b = createTextLayer({ text: 'b' });
    const doc = makeDoc(a, b);

    const cmd = new ReorderLayerToIndexCommand(a.id, 0);
    const after = cmd.execute(doc);

    expect(after).toBe(doc);
  });

  it('clamps out-of-range indices to the closest valid index', () => {
    const a = createTextLayer({ text: 'a' });
    const b = createTextLayer({ text: 'b' });
    const c = createTextLayer({ text: 'c' });
    const doc = makeDoc(a, b, c);

    const cmd = new ReorderLayerToIndexCommand(a.id, 999);
    const after = cmd.execute(doc);

    expect(after.layers.map((l) => l.text)).toEqual(['b', 'c', 'a']);
  });

  it('returns the original document when the layer id is unknown', () => {
    const a = createTextLayer({ text: 'a' });
    const doc = makeDoc(a);

    const cmd = new ReorderLayerToIndexCommand('non-existent-id', 0);
    expect(cmd.execute(doc)).toBe(doc);
  });

  it('restores the layer to its original index on undo', () => {
    const a = createTextLayer({ text: 'a' });
    const b = createTextLayer({ text: 'b' });
    const c = createTextLayer({ text: 'c' });
    const doc = makeDoc(a, b, c);

    const cmd = new ReorderLayerToIndexCommand(a.id, 2);
    const reordered = cmd.execute(doc);
    const undone = cmd.undo(reordered);

    expect(undone.layers.map((l) => l.text)).toEqual(['a', 'b', 'c']);
  });
});
