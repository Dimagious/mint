import type { CanvasPresetId } from './canvas-preset';

export interface TextShadow {
  readonly offsetX: number;
  readonly offsetY: number;
  readonly blur: number;
  readonly color: string;
}

export interface TextStroke {
  readonly width: number;
  readonly color: string;
}

export interface TextBackground {
  readonly color: string;
  readonly padding: number;
  readonly borderRadius: number;
}

export interface TextStyle {
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly fontWeight: number;
  readonly color: string;
  readonly opacity: number;
  readonly textAlign: 'left' | 'center' | 'right';
  readonly lineHeight: number;
  readonly letterSpacing: number;
  readonly shadow: TextShadow | null;
  readonly stroke: TextStroke | null;
  readonly background: TextBackground | null;
}

export interface TextLayerData {
  readonly id: string;
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly rotation: number;
  readonly style: TextStyle;
  readonly visible: boolean;
  readonly locked: boolean;
}

export interface BackgroundData {
  readonly dataUrl: string | null;
  readonly fit: 'contain' | 'cover';
}

export interface EditorDocument {
  readonly presetId: CanvasPresetId;
  readonly background: BackgroundData;
  readonly layers: readonly TextLayerData[];
}
