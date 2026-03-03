import { describe, it, expect } from 'vitest';
import { API_VERSION } from '../index';

describe('api', () => {
  it('should export API version', () => {
    expect(API_VERSION).toBe('0.1.0');
  });
});
