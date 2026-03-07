import type { CanvasPresetId } from '../types/canvas-preset';
import type {
  EditorDocument,
  TextLayerData,
  TextStyle,
} from '../types/editor-document';

let layerCounter = 0;

function nextLayerId(): string {
  layerCounter += 1;
  return `layer-${Date.now()}-${layerCounter}`;
}

const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: 'Arial',
  fontSize: 48,
  fontWeight: 400,
  color: '#ffffff',
  opacity: 1,
  textAlign: 'center',
  lineHeight: 1.2,
  letterSpacing: 0,
  shadow: null,
  stroke: null,
  background: null,
};

export function createTextLayer(
  overrides?: Partial<Omit<TextLayerData, 'id'>>,
): TextLayerData {
  return {
    id: nextLayerId(),
    text: 'New Text',
    x: 100,
    y: 100,
    width: 400,
    height: 100,
    rotation: 0,
    style: { ...DEFAULT_TEXT_STYLE },
    visible: true,
    locked: false,
    ...overrides,
  };
}

export function createDefaultDocument(
  presetId: CanvasPresetId = 'square',
): EditorDocument {
  return {
    presetId,
    background: { dataUrl: null, fit: 'contain', color: '#1a1a2e' },
    layers: [],
  };
}
