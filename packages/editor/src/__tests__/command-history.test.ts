import { describe, it, expect } from 'vitest';
import { CommandHistory } from '../commands/command-history';
import { AddTextLayerCommand } from '../commands/add-text-layer-command';
import { RemoveTextLayerCommand } from '../commands/remove-text-layer-command';
import { UpdateTextLayerCommand } from '../commands/update-text-layer-command';
import { ReorderLayerCommand } from '../commands/reorder-layer-command';
import type { EditorDocument, TextLayerData } from '@social-posts-helper/core';
import {
  createDefaultDocument,
  createTextLayer,
} from '@social-posts-helper/core';

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
});
