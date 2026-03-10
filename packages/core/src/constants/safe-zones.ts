import type { CanvasPresetId } from '../types/canvas-preset';

export interface SafeZone {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

export const SAFE_ZONES: Readonly<Record<CanvasPresetId, SafeZone>> = {
  square: { top: 120, right: 80, bottom: 120, left: 80 },
  portrait: { top: 140, right: 90, bottom: 180, left: 90 },
  story: { top: 250, right: 80, bottom: 320, left: 80 },
};

export function getSafeZoneByPresetId(presetId: CanvasPresetId): SafeZone {
  return SAFE_ZONES[presetId];
}
