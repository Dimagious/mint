import { describe, it, expect } from 'vitest';
import { CANVAS_PRESETS, getPresetById } from '../constants/canvas-presets';

describe('canvas presets', () => {
  it('should have 3 presets', () => {
    expect(CANVAS_PRESETS).toHaveLength(3);
  });

  it('should have correct dimensions for square', () => {
    const preset = getPresetById('square');
    expect(preset.width).toBe(1080);
    expect(preset.height).toBe(1080);
  });

  it('should have correct dimensions for portrait', () => {
    const preset = getPresetById('portrait');
    expect(preset.width).toBe(1080);
    expect(preset.height).toBe(1350);
  });

  it('should have correct dimensions for story', () => {
    const preset = getPresetById('story');
    expect(preset.width).toBe(1080);
    expect(preset.height).toBe(1920);
  });

  it('should throw for unknown preset', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => getPresetById('unknown' as any)).toThrow('Unknown preset');
  });
});
