import { create } from 'zustand';
import type {
  EditorDocument,
  TextLayerData,
  CanvasPresetId,
  BackgroundData,
} from '@mint/core';
import { createDefaultDocument, createTextLayer } from '@mint/core';
import type { Command } from '../commands/command';
import { CommandHistory } from '../commands/command-history';
import { AddTextLayerCommand } from '../commands/add-text-layer-command';
import { RemoveTextLayerCommand } from '../commands/remove-text-layer-command';
import { UpdateTextLayerCommand } from '../commands/update-text-layer-command';
import { ReorderLayerCommand } from '../commands/reorder-layer-command';
import { ReorderLayerToIndexCommand } from '../commands/reorder-layer-to-index-command';
import { SetBackgroundCommand } from '../commands/set-background-command';
import { ChangePresetCommand } from '../commands/change-preset-command';

export interface EditorState {
  document: EditorDocument;
  selectedLayerId: string | null;
  canUndo: boolean;
  canRedo: boolean;
  clipboard: Omit<TextLayerData, 'id'> | null;
  /**
   * Monotonic counter bumped on every mutation. Consumers that need a
   * cheap "did anything change" signal (e.g. the autosave badge) should
   * subscribe to this instead of doing a JSON.stringify(doc) on each
   * render.
   */
  revision: number;

  setPreset: (presetId: CanvasPresetId) => void;
  setBackground: (background: BackgroundData) => void;
  /** Returns the id of the newly created layer so the caller can select it. */
  addTextLayer: (overrides?: Partial<Omit<TextLayerData, 'id'>>) => string;
  removeTextLayer: (layerId: string) => void;
  updateTextLayer: (
    layerId: string,
    changes: Partial<Omit<TextLayerData, 'id'>>,
  ) => void;
  reorderLayer: (layerId: string, direction: 'up' | 'down') => void;
  reorderLayerToIndex: (layerId: string, newIndex: number) => void;
  selectLayer: (layerId: string | null) => void;
  duplicateLayer: (layerId: string) => void;
  copyLayer: () => void;
  pasteLayer: () => void;
  deleteSelectedLayer: () => void;
  undo: () => void;
  redo: () => void;
  loadDocument: (doc: EditorDocument) => void;
}

// Module-scope singleton so the command history survives Zustand setState
// rerenders. Tests that need an isolated history can use `__resetHistoryForTests`.
const history = new CommandHistory();

/** Test-only: reset the in-memory command history. */
export function __resetHistoryForTests(): void {
  history.clear();
}

export const useEditorStore = create<EditorState>((set, get) => {
  /**
   * Run a Command through the shared history and propagate the resulting
   * document + history flags into the store. Accepts optional `extra`
   * state that the caller wants to update atomically (e.g. clearing
   * `selectedLayerId` when the layer is removed).
   */
  function runCommand(
    command: Command,
    extra?: Partial<EditorState>,
  ): EditorDocument {
    const newDoc = history.execute(command, get().document);
    set((s) => ({
      ...s,
      ...extra,
      document: newDoc,
      canUndo: history.canUndo,
      canRedo: history.canRedo,
      revision: s.revision + 1,
    }));
    return newDoc;
  }

  return {
    document: createDefaultDocument(),
    selectedLayerId: null,
    canUndo: false,
    canRedo: false,
    clipboard: null,
    revision: 0,

    setPreset: (presetId) => {
      runCommand(new ChangePresetCommand(presetId));
    },

    setBackground: (background) => {
      runCommand(new SetBackgroundCommand(background));
    },

    addTextLayer: (overrides) => {
      const layer = createTextLayer(overrides);
      runCommand(new AddTextLayerCommand(layer), { selectedLayerId: layer.id });
      return layer.id;
    },

    removeTextLayer: (layerId) => {
      const extra =
        get().selectedLayerId === layerId ? { selectedLayerId: null } : {};
      runCommand(new RemoveTextLayerCommand(layerId), extra);
    },

    updateTextLayer: (layerId, changes) => {
      runCommand(new UpdateTextLayerCommand(layerId, changes));
    },

    reorderLayer: (layerId, direction) => {
      runCommand(new ReorderLayerCommand(layerId, direction));
    },

    reorderLayerToIndex: (layerId, newIndex) => {
      runCommand(new ReorderLayerToIndexCommand(layerId, newIndex));
    },

    selectLayer: (layerId) => {
      set({ selectedLayerId: layerId });
    },

    duplicateLayer: (layerId) => {
      const state = get();
      const source = state.document.layers.find((l) => l.id === layerId);
      if (!source) return;
      const { id: _unused, ...rest } = source;
      state.addTextLayer({ ...rest, x: rest.x + 20, y: rest.y + 20 });
    },

    copyLayer: () => {
      const state = get();
      if (!state.selectedLayerId) return;
      const source = state.document.layers.find(
        (l) => l.id === state.selectedLayerId,
      );
      if (!source) return;
      const { id: _unused, ...rest } = source;
      set({ clipboard: rest });
    },

    pasteLayer: () => {
      const state = get();
      if (!state.clipboard) return;
      state.addTextLayer({
        ...state.clipboard,
        x: state.clipboard.x + 20,
        y: state.clipboard.y + 20,
      });
    },

    deleteSelectedLayer: () => {
      const state = get();
      if (state.selectedLayerId) {
        state.removeTextLayer(state.selectedLayerId);
      }
    },

    undo: () => {
      const newDoc = history.undo(get().document);
      set((s) => ({
        document: newDoc,
        canUndo: history.canUndo,
        canRedo: history.canRedo,
        revision: s.revision + 1,
      }));
    },

    redo: () => {
      const newDoc = history.redo(get().document);
      set((s) => ({
        document: newDoc,
        canUndo: history.canUndo,
        canRedo: history.canRedo,
        revision: s.revision + 1,
      }));
    },

    loadDocument: (doc) => {
      history.clear();
      set((s) => ({
        document: doc,
        selectedLayerId: null,
        canUndo: false,
        canRedo: false,
        revision: s.revision + 1,
      }));
    },
  };
});
