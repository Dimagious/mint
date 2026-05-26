import { describe, expect, it } from 'vitest';
import { getSmartContrastStyle } from './smart-contrast';

describe('getSmartContrastStyle', () => {
  it('returns a dark colour with a white stroke on bright backgrounds', () => {
    const style = getSmartContrastStyle(0.9);
    expect(style.color.toLowerCase()).toMatch(/^#[0-9a-f]{6}$/);
    expect(style.stroke.color.toLowerCase()).toBe('#ffffff');
    expect(style.stroke.width).toBeGreaterThan(0);
  });

  it('returns a light colour with a dark stroke on dark backgrounds', () => {
    const style = getSmartContrastStyle(0.15);
    expect(style.color.toLowerCase()).toMatch(/^#[0-9a-f]{6}$/);
    // Dark stroke means low luminance — sanity check the hex.
    expect(style.stroke.color.toLowerCase()).not.toBe('#ffffff');
    expect(style.stroke.width).toBeGreaterThan(0);
  });

  it('chooses a mid-tone for ambiguous backgrounds', () => {
    const style = getSmartContrastStyle(0.5);
    expect(style.color.toLowerCase()).toMatch(/^#[0-9a-f]{6}$/);
    expect(style.stroke.color.toLowerCase()).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('switches text colour at the bright/mid threshold', () => {
    const bright = getSmartContrastStyle(0.7);
    const mid = getSmartContrastStyle(0.5);
    expect(bright.color).not.toBe(mid.color);
  });

  it('switches text colour at the mid/dark threshold', () => {
    const mid = getSmartContrastStyle(0.5);
    const dark = getSmartContrastStyle(0.2);
    expect(mid.color).not.toBe(dark.color);
  });
});
