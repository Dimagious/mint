import { describe, it, expect, beforeEach } from 'vitest';
import { createDefaultDocument, createTextLayer } from '@mint/core';
import type { EditorDocument } from '@mint/core';
import {
  encodeDocumentToHash,
  decodeDocumentFromHash,
  buildShareUrl,
  readShareFromLocation,
  clearShareFromLocation,
} from './share-link';

function setHash(hash: string): void {
  window.history.replaceState(null, '', `/${hash}`);
}

describe('share-link encode/decode', () => {
  it('round-trips a document with text layers', () => {
    const doc: EditorDocument = {
      ...createDefaultDocument(),
      layers: [
        createTextLayer({ text: 'Hello world' }),
        createTextLayer({ text: 'Привет, мир' }), // non-ASCII survives
      ],
    };
    const encoded = encodeDocumentToHash(doc);
    expect(encoded).toBeTruthy();
    const decoded = decodeDocumentFromHash(encoded!);
    expect(decoded?.layers.length).toBe(2);
    expect(decoded?.layers[0]?.text).toBe('Hello world');
    expect(decoded?.layers[1]?.text).toBe('Привет, мир');
  });

  it('strips the background image and manual transform on encode', () => {
    const doc: EditorDocument = {
      ...createDefaultDocument(),
      background: {
        ...createDefaultDocument().background,
        dataUrl:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        manual: { x: 10, y: 20, scale: 1.5 },
      },
    };
    const decoded = decodeDocumentFromHash(encodeDocumentToHash(doc)!);
    expect(decoded?.background.dataUrl).toBeNull();
    expect(decoded?.background.manual).toBeNull();
  });

  it('returns null for malformed input', () => {
    expect(decodeDocumentFromHash('')).toBeNull();
    expect(decodeDocumentFromHash('not-base64!@#')).toBeNull();
    expect(decodeDocumentFromHash('aGVsbG8=')).toBeNull(); // valid base64, not a doc
  });

  it('rejects payloads with the wrong version field', () => {
    const payload = { v: 999, doc: createDefaultDocument() };
    const bin = new TextEncoder().encode(JSON.stringify(payload));
    let s = '';
    for (let i = 0; i < bin.length; i++) s += String.fromCharCode(bin[i]!);
    const encoded = btoa(s)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    expect(decodeDocumentFromHash(encoded)).toBeNull();
  });

  it('rejects oversized payloads', () => {
    const long = 'a'.repeat(40_000);
    expect(decodeDocumentFromHash(long)).toBeNull();
  });

  it('strips a dataUrl smuggled into the wire format', () => {
    // Defence in depth: a hand-edited link claims to carry an image. We
    // strip it again post-decode so the recipient never sees it.
    const malicious = {
      v: 1,
      doc: {
        ...createDefaultDocument(),
        background: {
          ...createDefaultDocument().background,
          dataUrl:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        },
      },
    };
    const bin = new TextEncoder().encode(JSON.stringify(malicious));
    let s = '';
    for (let i = 0; i < bin.length; i++) s += String.fromCharCode(bin[i]!);
    const encoded = btoa(s)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    expect(decodeDocumentFromHash(encoded)?.background.dataUrl).toBeNull();
  });
});

describe('share-link URL helpers', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('buildShareUrl produces a #mint=... hash', () => {
    const url = buildShareUrl(createDefaultDocument());
    expect(url).toMatch(/#mint=[A-Za-z0-9_-]+$/);
  });

  it('readShareFromLocation returns the decoded doc when hash is present', () => {
    const encoded = encodeDocumentToHash({
      ...createDefaultDocument(),
      layers: [createTextLayer({ text: 'Hi' })],
    });
    setHash(`#mint=${encoded}`);
    const doc = readShareFromLocation();
    expect(doc?.layers[0]?.text).toBe('Hi');
  });

  it('readShareFromLocation returns null when no hash', () => {
    expect(readShareFromLocation()).toBeNull();
  });

  it('clearShareFromLocation removes the mint param but keeps other hash content', () => {
    setHash('#other=keep&mint=abc123');
    clearShareFromLocation();
    expect(window.location.hash).not.toMatch(/mint=/);
    expect(window.location.hash).toMatch(/other=keep/);
  });
});
