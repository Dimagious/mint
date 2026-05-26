import { describe, it, expect } from 'vitest';
import { createDefaultDocument, createTextLayer } from '@mint/core';
import { isEditorDocument } from './document-validation';

describe('isEditorDocument', () => {
  it('accepts a valid document', () => {
    const doc = {
      ...createDefaultDocument(),
      layers: [createTextLayer()],
    };

    expect(isEditorDocument(doc)).toBe(true);
  });

  it('rejects documents without a valid background object', () => {
    const invalid = {
      ...createDefaultDocument(),
      background: undefined,
    };

    expect(isEditorDocument(invalid)).toBe(false);
  });

  it('rejects layers with missing style', () => {
    const invalid = {
      ...createDefaultDocument(),
      layers: [
        {
          id: 'layer-1',
          text: 'Hello',
          x: 0,
          y: 0,
          width: 300,
          height: 100,
          rotation: 0,
          visible: true,
          locked: false,
        },
      ],
    };

    expect(isEditorDocument(invalid)).toBe(false);
  });

  it('rejects layers with absurd fontSize', () => {
    const layer = createTextLayer();
    const invalid = {
      ...createDefaultDocument(),
      layers: [{ ...layer, style: { ...layer.style, fontSize: 1e9 } }],
    };
    expect(isEditorDocument(invalid)).toBe(false);
  });

  it('rejects layers with text longer than 4096 chars', () => {
    const layer = createTextLayer();
    const invalid = {
      ...createDefaultDocument(),
      layers: [{ ...layer, text: 'a'.repeat(5000) }],
    };
    expect(isEditorDocument(invalid)).toBe(false);
  });

  it('rejects backgrounds with a javascript: dataUrl', () => {
    const doc = createDefaultDocument();
    const invalid = {
      ...doc,
      background: {
        ...doc.background,
        dataUrl: 'javascript:alert(1)',
      },
    };
    expect(isEditorDocument(invalid)).toBe(false);
  });

  it('rejects backgrounds with an http(s) URL pretending to be a dataUrl', () => {
    const doc = createDefaultDocument();
    const invalid = {
      ...doc,
      background: {
        ...doc.background,
        dataUrl: 'https://evil.example.com/x.png',
      },
    };
    expect(isEditorDocument(invalid)).toBe(false);
  });

  it('accepts a well-formed image dataUrl', () => {
    const doc = createDefaultDocument();
    const valid = {
      ...doc,
      background: {
        ...doc.background,
        // 1x1 PNG, the smallest base64 we can build
        dataUrl:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      },
    };
    expect(isEditorDocument(valid)).toBe(true);
  });

  it('rejects malformed color strings', () => {
    const layer = createTextLayer();
    const invalid = {
      ...createDefaultDocument(),
      layers: [
        {
          ...layer,
          style: { ...layer.style, color: 'not a real color' },
        },
      ],
    };
    expect(isEditorDocument(invalid)).toBe(false);
  });

  it('accepts a valid manual background transform', () => {
    const doc = createDefaultDocument();
    const valid = {
      ...doc,
      background: {
        ...doc.background,
        manual: { x: 100, y: 50, scale: 1.5 },
      },
    };
    expect(isEditorDocument(valid)).toBe(true);
  });

  it('accepts a null manual background transform', () => {
    const doc = createDefaultDocument();
    const valid = {
      ...doc,
      background: { ...doc.background, manual: null },
    };
    expect(isEditorDocument(valid)).toBe(true);
  });

  it('rejects a manual transform with an out-of-bounds scale', () => {
    const doc = createDefaultDocument();
    const invalid = {
      ...doc,
      background: {
        ...doc.background,
        manual: { x: 0, y: 0, scale: 9999 },
      },
    };
    expect(isEditorDocument(invalid)).toBe(false);
  });

  it('rejects a manual transform with a non-finite coordinate', () => {
    const doc = createDefaultDocument();
    const invalid = {
      ...doc,
      background: {
        ...doc.background,
        manual: { x: Infinity, y: 0, scale: 1 },
      },
    };
    expect(isEditorDocument(invalid)).toBe(false);
  });

  it('rejects documents with too many layers', () => {
    const layer = createTextLayer();
    const layers = Array.from({ length: 101 }, (_, i) => ({
      ...layer,
      id: `layer-${i}`,
    }));
    const invalid = { ...createDefaultDocument(), layers };
    expect(isEditorDocument(invalid)).toBe(false);
  });
});
