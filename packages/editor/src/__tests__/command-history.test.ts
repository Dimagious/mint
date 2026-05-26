import { describe, it, expect } from 'vitest';
import { CommandHistory } from '../commands/command-history';
import { AddTextLayerCommand } from '../commands/add-text-layer-command';
import { RemoveTextLayerCommand } from '../commands/remove-text-layer-command';
import { UpdateTextLayerCommand } from '../commands/update-text-layer-command';
import { ReorderLayerCommand } from '../commands/reorder-layer-command';
import type { EditorDocument, TextLayerData } from '@mint/core';
import { createDefaultDocument, createTextLayer } from '@mint/core';

function makeDoc(...layers: TextLayerData[]): EditorDocument {
  return { ...createDefaultDocument(), layers };
}

describe('CommandHistory', () => {
  it('should execute and undo add layer command', () => {
    const history = new CommandHistory();
    const layer = createTextLayer({ text: 'Hello' });
    const doc = createDefaultDocument();

    const afterAdd = history.execute(new AddTextLayerCommand(layer), doc);
    expect(afterAdd.layers).toHaveLength(1);
    expect(afterAdd.layers[0]?.text).toBe('Hello');

    const afterUndo = history.undo(afterAdd);
    expect(afterUndo.layers).toHaveLength(0);
  });

  it('should support redo after undo', () => {
    const history = new CommandHistory();
    const layer = createTextLayer({ text: 'Hello' });
    const doc = createDefaultDocument();

    const afterAdd = history.execute(new AddTextLayerCommand(layer), doc);
    const afterUndo = history.undo(afterAdd);
    const afterRedo = history.redo(afterUndo);

    expect(afterRedo.layers).toHaveLength(1);
  });

  it('should clear redo stack on new execute', () => {
    const history = new CommandHistory();
    const layer1 = createTextLayer({ text: 'A' });
    const layer2 = createTextLayer({ text: 'B' });
    const doc = createDefaultDocument();

    const after1 = history.execute(new AddTextLayerCommand(layer1), doc);
    const afterUndo = history.undo(after1);
    history.execute(new AddTextLayerCommand(layer2), afterUndo);

    expect(history.canRedo).toBe(false);
  });

  it('should track canUndo and canRedo', () => {
    const history = new CommandHistory();
    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(false);

    const layer = createTextLayer();
    const doc = createDefaultDocument();
    history.execute(new AddTextLayerCommand(layer), doc);
    expect(history.canUndo).toBe(true);
    expect(history.canRedo).toBe(false);
  });

  it('should remove a layer and undo', () => {
    const history = new CommandHistory();
    const layer = createTextLayer({ text: 'Remove me' });
    const doc = makeDoc(layer);

    const afterRemove = history.execute(
      new RemoveTextLayerCommand(layer.id),
      doc,
    );
    expect(afterRemove.layers).toHaveLength(0);

    const afterUndo = history.undo(afterRemove);
    expect(afterUndo.layers).toHaveLength(1);
    expect(afterUndo.layers[0]?.text).toBe('Remove me');
  });

  it('should update a layer and undo', () => {
    const history = new CommandHistory();
    const layer = createTextLayer({ text: 'Original' });
    const doc = makeDoc(layer);

    const afterUpdate = history.execute(
      new UpdateTextLayerCommand(layer.id, { text: 'Changed' }),
      doc,
    );
    expect(afterUpdate.layers[0]?.text).toBe('Changed');

    const afterUndo = history.undo(afterUpdate);
    expect(afterUndo.layers[0]?.text).toBe('Original');
  });

  it('should reorder layers and undo', () => {
    const history = new CommandHistory();
    const a = createTextLayer({ text: 'A' });
    const b = createTextLayer({ text: 'B' });
    const doc = makeDoc(a, b);

    const afterReorder = history.execute(
      new ReorderLayerCommand(a.id, 'up'),
      doc,
    );
    expect(afterReorder.layers[0]?.text).toBe('B');
    expect(afterReorder.layers[1]?.text).toBe('A');

    const afterUndo = history.undo(afterReorder);
    expect(afterUndo.layers[0]?.text).toBe('A');
    expect(afterUndo.layers[1]?.text).toBe('B');
  });

  it('caps the undo stack at the configured size', () => {
    // Use a clock that jumps far beyond the coalesce window between calls so
    // each command pushes a fresh entry instead of merging.
    let nowMs = 0;
    const history = new CommandHistory({
      cap: 3,
      now: () => {
        nowMs += 10_000;
        return nowMs;
      },
    });
    const a = createTextLayer({ text: 'A' });
    let doc: EditorDocument = makeDoc(a);

    for (let i = 0; i < 5; i++) {
      doc = history.execute(
        new UpdateTextLayerCommand(a.id, { text: `v${i}` }),
        doc,
      );
    }
    expect(history.size).toBe(3);
    expect(doc.layers[0]?.text).toBe('v4');
  });

  it('coalesces consecutive UpdateTextLayer commands on the same layer', () => {
    let nowMs = 1000;
    const history = new CommandHistory({ now: () => nowMs });
    const a = createTextLayer({ text: 'A' });
    let doc: EditorDocument = makeDoc(a);

    // Three font-size ticks 50 ms apart — should merge into a single entry.
    doc = history.execute(
      new UpdateTextLayerCommand(a.id, {
        style: { ...a.style, fontSize: 100 },
      }),
      doc,
    );
    nowMs += 50;
    doc = history.execute(
      new UpdateTextLayerCommand(a.id, {
        style: { ...a.style, fontSize: 110 },
      }),
      doc,
    );
    nowMs += 50;
    doc = history.execute(
      new UpdateTextLayerCommand(a.id, {
        style: { ...a.style, fontSize: 120 },
      }),
      doc,
    );

    expect(history.size).toBe(1);
    expect(doc.layers[0]?.style.fontSize).toBe(120);

    // One undo should restore the original font size, not just the last tick.
    const undone = history.undo(doc);
    expect(undone.layers[0]?.style.fontSize).toBe(a.style.fontSize);
  });

  it('does not coalesce updates on different layers', () => {
    const history = new CommandHistory();
    const a = createTextLayer({ text: 'A' });
    const b = createTextLayer({ text: 'B' });
    let doc: EditorDocument = makeDoc(a, b);

    doc = history.execute(
      new UpdateTextLayerCommand(a.id, { text: 'A2' }),
      doc,
    );
    history.execute(new UpdateTextLayerCommand(b.id, { text: 'B2' }), doc);

    expect(history.size).toBe(2);
  });

  it('does not coalesce updates outside the coalesce window', () => {
    let nowMs = 1000;
    const history = new CommandHistory({ now: () => nowMs });
    const a = createTextLayer({ text: 'A' });
    let doc: EditorDocument = makeDoc(a);

    doc = history.execute(
      new UpdateTextLayerCommand(a.id, { text: 'A2' }),
      doc,
    );
    nowMs += 5000; // far outside the 300ms window
    history.execute(new UpdateTextLayerCommand(a.id, { text: 'A3' }), doc);

    expect(history.size).toBe(2);
  });
});
