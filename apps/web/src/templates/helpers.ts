import type { TextLayerData, TextStyle } from '@mint/core';

/**
 * Default text style baseline used by templates. Individual templates
 * override only the fields they care about (font, size, color, shadow…).
 */
const BASE_STYLE: TextStyle = {
  fontFamily: 'Inter',
  fontSize: 96,
  fontWeight: 600,
  color: '#1A1D1B',
  opacity: 1,
  textAlign: 'center',
  lineHeight: 1.15,
  letterSpacing: 0,
  shadow: null,
  stroke: null,
  background: null,
};

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

export interface LayerSpec {
  id?: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height?: number;
  rotation?: number;
  style?: Partial<TextStyle>;
  visible?: boolean;
  locked?: boolean;
}

/**
 * Create a TextLayerData from a partial spec — applies BASE_STYLE
 * underneath the per-layer style overrides. Keeps template definitions
 * focused on the bits that actually matter (font, size, position) and
 * lets the editor's defaults handle the rest.
 */
export function layer(spec: LayerSpec): TextLayerData {
  return {
    id: spec.id ?? nextId('tpl'),
    text: spec.text,
    x: spec.x,
    y: spec.y,
    width: spec.width,
    height: spec.height ?? 200,
    rotation: spec.rotation ?? 0,
    style: { ...BASE_STYLE, ...spec.style } as TextStyle,
    visible: spec.visible ?? true,
    locked: spec.locked ?? false,
  };
}
