export type { CanvasPreset, CanvasPresetId } from './types/canvas-preset';
export type {
  EditorDocument,
  TextLayerData,
  BackgroundData,
  TextStyle,
  TextShadow,
  TextStroke,
  TextBackground,
} from './types/editor-document';
export type { ExportFormat, ExportOptions } from './types/export';
export type { LayerAction } from './types/layer-action';

export { CANVAS_PRESETS, getPresetById } from './constants/canvas-presets';
export {
  createDefaultDocument,
  createTextLayer,
} from './factories/document-factory';
export { generateExportFilename } from './utils/filename';
