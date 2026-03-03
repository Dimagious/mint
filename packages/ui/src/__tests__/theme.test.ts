import { describe, it, expect } from 'vitest';
import { theme } from '../theme';

describe('theme', () => {
  it('should use dark mode', () => {
    expect(theme.palette.mode).toBe('dark');
  });

  it('should have primary color', () => {
    expect(theme.palette.primary.main).toBe('#6c63ff');
  });
});
