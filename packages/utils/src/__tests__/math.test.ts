import { describe, it, expect } from 'vitest';
import { clamp } from '../math';

describe('clamp', () => {
  it('should clamp value to min', () => {
    expect(clamp(-5, 0, 100)).toBe(0);
  });

  it('should clamp value to max', () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it('should return value when in range', () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });
});
