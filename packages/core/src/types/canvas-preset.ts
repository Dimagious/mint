export interface CanvasPreset {
  readonly id: CanvasPresetId;
  readonly label: string;
  readonly width: number;
  readonly height: number;
}

export type CanvasPresetId = 'square' | 'portrait' | 'story';
