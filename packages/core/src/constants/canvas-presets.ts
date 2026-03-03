import type { CanvasPreset, CanvasPresetId } from '../types/canvas-preset';

export const CANVAS_PRESETS: readonly CanvasPreset[] = [
  { id: 'square', label: '1080 × 1080 (Square)', width: 1080, height: 1080 },
  {
    id: 'portrait',
    label: '1080 × 1350 (Portrait)',
    width: 1080,
    height: 1350,
  },
  { id: 'story', label: '1080 × 1920 (Story)', width: 1080, height: 1920 },
] as const;

export function getPresetById(id: CanvasPresetId): CanvasPreset {
  const preset = CANVAS_PRESETS.find((p) => p.id === id);
  if (!preset) {
    throw new Error(`Unknown preset: ${id}`);
  }
  return preset;
}
