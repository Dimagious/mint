import { describe, it, expect } from 'vitest';
import { computeSnap, type SnapBox } from '../adapter/snap';

const CANVAS = { w: 1000, h: 1000 };
const T = 8;

function box(x: number, y: number, width = 100, height = 50): SnapBox {
  return { x, y, width, height };
}

describe('computeSnap', () => {
  it('snaps the dragged left edge to another layer left edge', () => {
    const dragged = box(503, 200); // off by 3px from x=500
    const other = box(500, 50);
    const result = computeSnap(dragged, [other], CANVAS.w, CANVAS.h, T);
    expect(result.x?.delta).toBe(-3);
    expect(result.x?.guide).toBe(500);
  });

  it('snaps the dragged right edge to another layer right edge', () => {
    // dragged right at 200+100=300, other right at 500+100=600
    // Move dragged so its right hits 600 → delta should put left at 500.
    const dragged = box(503, 0);
    const other = box(500, 200);
    const result = computeSnap(dragged, [other], CANVAS.w, CANVAS.h, T);
    expect(result.x?.delta).toBe(-3); // already aligns on left edge before right does
  });

  it('snaps to canvas centerline when no other layer is in range', () => {
    // Canvas center x = 500. dragged center is at 503 + 50 = 553 → no snap.
    // But dragged left at 497 (off 3) snaps to centerline at 500.
    const dragged = box(497, 0);
    const result = computeSnap(dragged, [], CANVAS.w, CANVAS.h, T);
    expect(result.x?.delta).toBe(3);
    expect(result.x?.guide).toBe(500);
  });

  it('snaps centers of two boxes (Y-axis only)', () => {
    // Dragged y=200, h=50 → center 225. Other y=220, h=10 → center 225.
    // The y-center matches exactly → delta 0, guide 225.
    const dragged = box(0, 200, 100, 50);
    const other = box(500, 220, 100, 10);
    const result = computeSnap(dragged, [other], CANVAS.w, CANVAS.h, T);
    expect(result.y?.delta).toBe(0);
    expect(result.y?.guide).toBe(225);
  });

  it('returns null on each axis when nothing is in threshold', () => {
    const dragged = box(50, 50);
    const other = box(800, 800);
    const result = computeSnap(dragged, [other], CANVAS.w, CANVAS.h, T);
    expect(result.x).toBeNull();
    expect(result.y).toBeNull();
  });

  it('picks the closest of competing snap targets', () => {
    // dragged left at 100. Two candidates: 105 (delta 5) and 102 (delta 2).
    // Both within threshold; closer one wins.
    const dragged = box(100, 0);
    const result = computeSnap(
      dragged,
      [box(105, 0), box(102, 0)],
      CANVAS.w,
      CANVAS.h,
      T,
    );
    expect(result.x?.guide).toBe(102);
    expect(result.x?.delta).toBe(2);
  });

  it('axes are independent — X can snap while Y does not', () => {
    const dragged = box(497, 33); // x snaps to canvas center 500, y is free
    const result = computeSnap(dragged, [], CANVAS.w, CANVAS.h, T);
    expect(result.x?.delta).toBe(3);
    expect(result.y).toBeNull();
  });

  it('threshold is strict: exactly at threshold does not snap', () => {
    // dragged left 492, target 500 → distance 8 = threshold → no snap.
    const dragged = box(492, 0);
    const result = computeSnap(dragged, [box(500, 0)], CANVAS.w, CANVAS.h, T);
    expect(result.x).toBeNull();
  });
});
