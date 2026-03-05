import { describe, it, expect } from 'vitest';
import { CANVAS_PRESETS } from '@mint/core';

describe('web app', () => {
  it('should have canvas presets available', () => {
    expect(CANVAS_PRESETS.length).toBeGreaterThan(0);
  });

  it('all presets should have 1080px width', () => {
    for (const preset of CANVAS_PRESETS) {
      expect(preset.width).toBe(1080);
    }
  });
});
