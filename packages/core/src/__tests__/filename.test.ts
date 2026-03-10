import { describe, it, expect } from 'vitest';
import { generateExportFilename } from '../utils/filename';

describe('generateExportFilename', () => {
  it('should generate PNG filename with correct format', () => {
    const filename = generateExportFilename('square', 'png');
    expect(filename).toMatch(/^mint_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.png$/);
  });

  it('should generate JPG filename for jpeg format', () => {
    const filename = generateExportFilename('portrait', 'jpeg');
    expect(filename).toMatch(/^mint_.*\.jpg$/);
  });

  it('should start with mint prefix', () => {
    const filename = generateExportFilename('story', 'png');
    expect(filename).toMatch(/^mint_/);
  });
});
