import { describe, expect, it } from 'vitest';
import type { TextLayerData } from '@mint/core';
import { createTextLayer } from '@mint/core';
import { calculateFitFontSize } from './text-fit';

function makeLayer(overrides: Partial<TextLayerData> = {}): TextLayerData {
  return createTextLayer(overrides);
}

describe('calculateFitFontSize', () => {
  it('returns a positive integer font size', () => {
    const layer = makeLayer({ text: 'Hello', width: 400 });
    const size = calculateFitFontSize(layer);
    expect(Number.isFinite(size)).toBe(true);
    expect(size).toBeGreaterThan(0);
  });

  it('never goes below the floor (8px)', () => {
    const layer = makeLayer({
      text: 'A very very very very long headline that cannot fit anywhere',
      width: 20,
    });
    const size = calculateFitFontSize(layer);
    expect(size).toBeGreaterThanOrEqual(8);
  });

  it('never goes above the ceiling (240px)', () => {
    const layer = makeLayer({ text: '.', width: 10_000 });
    const size = calculateFitFontSize(layer);
    expect(size).toBeLessThanOrEqual(240);
  });

  it('does not crash on an empty text string', () => {
    const layer = makeLayer({ text: '', width: 400 });
    const size = calculateFitFontSize(layer);
    expect(Number.isFinite(size)).toBe(true);
    expect(size).toBeGreaterThanOrEqual(8);
  });

  it('returns a smaller size for narrower layers (monotonic)', () => {
    const wide = calculateFitFontSize(
      makeLayer({ text: 'Hello world headline', width: 800 }),
    );
    const narrow = calculateFitFontSize(
      makeLayer({ text: 'Hello world headline', width: 200 }),
    );
    expect(narrow).toBeLessThanOrEqual(wide);
  });

  it('accounts for the background fill padding', () => {
    const noPad = makeLayer({
      text: 'Headline',
      width: 400,
      style: { ...makeLayer().style, background: null },
    });
    const padded = makeLayer({
      text: 'Headline',
      width: 400,
      style: {
        ...makeLayer().style,
        background: { color: '#000', padding: 40, borderRadius: 4 },
      },
    });
    expect(calculateFitFontSize(padded)).toBeLessThanOrEqual(
      calculateFitFontSize(noPad),
    );
  });
});
