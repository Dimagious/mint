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

export interface BackgroundTransform {
  /** Top-left x of the image, in canvas pixels. */
  readonly x: number;
  /** Top-left y of the image, in canvas pixels. */
  readonly y: number;
  /** Uniform scale applied to the original image dimensions. */
  readonly scale: number;
}

export interface BackgroundData {
  readonly dataUrl: string | null;
  /**
   * Auto-fit strategy applied when no manual transform is set. When the
   * user drags or zooms the photo on the canvas the result is recorded
   * in `manual`; the fit field then only matters for the "Reset" path
   * and for the first paint when an image is first dropped.
   */
  readonly fit: 'contain' | 'cover';
  readonly color: string;
  /**
   * Manual position + scale of the background image. When set, the
   * editor honours this instead of the `fit`-derived layout. Toggling
   * the Crop/Fit button clears this, returning the photo to auto-fit.
   */
  readonly manual?: BackgroundTransform | null;
}

export interface EditorDocument {
  readonly presetId: CanvasPresetId;
  readonly background: BackgroundData;
  readonly layers: readonly TextLayerData[];
}
