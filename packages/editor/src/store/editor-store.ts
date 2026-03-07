import { create } from 'zustand';
import type {
  EditorDocument,
  TextLayerData,
  CanvasPresetId,
  BackgroundData,
  ExportOptions,
} from '@mint/core';
import {
  createDefaultDocument,
  createTextLayer,
  getPresetById,
  generateExportFilename,
} from '@mint/core';
import { CommandHistory } from '../commands/command-history';
import { AddTextLayerCommand } from '../commands/add-text-layer-command';
import { RemoveTextLayerCommand } from '../commands/remove-text-layer-command';
import { UpdateTextLayerCommand } from '../commands/update-text-layer-command';
import { ReorderLayerCommand } from '../commands/reorder-layer-command';
import { SetBackgroundCommand } from '../commands/set-background-command';
import { ChangePresetCommand } from '../commands/change-preset-command';

export interface EditorState {
  document: EditorDocument;
  selectedLayerId: string | null;
  canUndo: boolean;
  canRedo: boolean;
  clipboard: Omit<TextLayerData, 'id'> | null;

  setPreset: (presetId: CanvasPresetId) => void;
  setBackground: (background: BackgroundData) => void;
  addTextLayer: (overrides?: Partial<Omit<TextLayerData, 'id'>>) => void;
  removeTextLayer: (layerId: string) => void;
  updateTextLayer: (
    layerId: string,
    changes: Partial<Omit<TextLayerData, 'id'>>,
  ) => void;
  reorderLayer: (layerId: string, direction: 'up' | 'down') => void;
  selectLayer: (layerId: string | null) => void;
  duplicateLayer: (layerId: string) => void;
  copyLayer: () => void;
  pasteLayer: () => void;
  deleteSelectedLayer: () => void;
  undo: () => void;
  redo: () => void;
  loadDocument: (doc: EditorDocument) => void;
  exportCanvas: (
    canvas: HTMLCanvasElement,
    options: ExportOptions,
  ) => Promise<void>;
}

const history = new CommandHistory();

export const useEditorStore = create<EditorState>((set, get) => ({
  document: createDefaultDocument(),
  selectedLayerId: null,
  canUndo: false,
  canRedo: false,
  clipboard: null,

  setPreset: (presetId) => {
    const cmd = new ChangePresetCommand(presetId);
    const newDoc = history.execute(cmd, get().document);
    set({
      document: newDoc,
      canUndo: history.canUndo,
      canRedo: history.canRedo,
    });
  },

  setBackground: (background) => {
    const cmd = new SetBackgroundCommand(background);
    const newDoc = history.execute(cmd, get().document);
    set({
      document: newDoc,
      canUndo: history.canUndo,
      canRedo: history.canRedo,
    });
  },

  addTextLayer: (overrides) => {
    const layer = createTextLayer(overrides);
    const cmd = new AddTextLayerCommand(layer);
    const newDoc = history.execute(cmd, get().document);
    set({
      document: newDoc,
      selectedLayerId: layer.id,
      canUndo: history.canUndo,
      canRedo: history.canRedo,
    });
  },

  removeTextLayer: (layerId) => {
    const cmd = new RemoveTextLayerCommand(layerId);
    const newDoc = history.execute(cmd, get().document);
    const state = get();
    set({
      document: newDoc,
      selectedLayerId:
        state.selectedLayerId === layerId ? null : state.selectedLayerId,
      canUndo: history.canUndo,
      canRedo: history.canRedo,
    });
  },

  updateTextLayer: (layerId, changes) => {
    const cmd = new UpdateTextLayerCommand(layerId, changes);
    const newDoc = history.execute(cmd, get().document);
    set({
      document: newDoc,
      canUndo: history.canUndo,
      canRedo: history.canRedo,
    });
  },

  reorderLayer: (layerId, direction) => {
    const cmd = new ReorderLayerCommand(layerId, direction);
    const newDoc = history.execute(cmd, get().document);
    set({
      document: newDoc,
      canUndo: history.canUndo,
      canRedo: history.canRedo,
    });
  },

  selectLayer: (layerId) => {
    set({ selectedLayerId: layerId });
  },

  duplicateLayer: (layerId) => {
    const state = get();
    const source = state.document.layers.find((l) => l.id === layerId);
    if (!source) return;
    const { id: _, ...rest } = source;
    state.addTextLayer({ ...rest, x: rest.x + 20, y: rest.y + 20 });
  },

  copyLayer: () => {
    const state = get();
    if (!state.selectedLayerId) return;
    const source = state.document.layers.find(
      (l) => l.id === state.selectedLayerId,
    );
    if (!source) return;
    const { id: _, ...rest } = source;
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
    set({
      document: newDoc,
      canUndo: history.canUndo,
      canRedo: history.canRedo,
    });
  },

  redo: () => {
    const newDoc = history.redo(get().document);
    set({
      document: newDoc,
      canUndo: history.canUndo,
      canRedo: history.canRedo,
    });
  },

  loadDocument: (doc) => {
    history.clear();
    set({
      document: doc,
      selectedLayerId: null,
      canUndo: false,
      canRedo: false,
    });
  },

  exportCanvas: async (canvas, options) => {
    const { document: doc } = get();
    const preset = getPresetById(doc.presetId);

    const exportCanvas = window.document.createElement('canvas');
    exportCanvas.width = preset.width;
    exportCanvas.height = preset.height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    ctx.drawImage(canvas, 0, 0, preset.width, preset.height);

    const mimeType = options.format === 'jpeg' ? 'image/jpeg' : 'image/png';

    const blob = await new Promise<Blob>((resolve, reject) => {
      exportCanvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create blob'));
        },
        mimeType,
        options.format === 'jpeg' ? options.quality / 100 : undefined,
      );
    });

    const filename = generateExportFilename(doc.presetId, options.format);
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = filename;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
}));
