import { describe, it, expect } from 'vitest';
import { theme } from '../theme';

describe('theme', () => {
  it('should use light mode', () => {
    expect(theme.palette.mode).toBe('light');
  });

  it('should have primary color', () => {
    expect(theme.palette.primary.main).toBe('#2f9f7a');
  });
});
