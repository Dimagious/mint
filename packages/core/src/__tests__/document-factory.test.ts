import { describe, it, expect } from 'vitest';
import {
  createDefaultDocument,
  createTextLayer,
} from '../factories/document-factory';

describe('document factory', () => {
  it('should create default document with square preset', () => {
    const doc = createDefaultDocument();
    expect(doc.presetId).toBe('square');
    expect(doc.background.dataUrl).toBeNull();
    expect(doc.layers).toHaveLength(0);
  });

  it('should create document with specified preset', () => {
    const doc = createDefaultDocument('story');
    expect(doc.presetId).toBe('story');
  });

  it('should create text layer with defaults', () => {
    const layer = createTextLayer();
    expect(layer.text).toBe('New Text');
    expect(layer.visible).toBe(true);
    expect(layer.locked).toBe(false);
    expect(layer.style.fontFamily).toBe('Arial');
    expect(layer.id).toBeTruthy();
  });

  it('should create text layer with overrides', () => {
    const layer = createTextLayer({ text: 'Custom', x: 200 });
    expect(layer.text).toBe('Custom');
    expect(layer.x).toBe(200);
  });

  it('should create unique layer ids', () => {
    const a = createTextLayer();
    const b = createTextLayer();
    expect(a.id).not.toBe(b.id);
  });
});
