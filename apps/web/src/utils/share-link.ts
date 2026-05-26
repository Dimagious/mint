import type { EditorDocument } from '@mint/core';
import { isEditorDocument } from './document-validation';

/**
 * Shareable project links — encode an `EditorDocument` into a URL hash
 * fragment so users can paste a single link into chat/social and the
 * recipient sees the same composition.
 *
 * Trade-offs:
 *  - Background photos can be 15 MB after base64 inflation; embedding
 *    them in a URL would break in most chat apps (Telegram/Twitter
 *    truncate). We deliberately strip `dataUrl` (and the matching
 *    `manual` transform that only makes sense alongside an image)
 *    before encoding. Recipients add their own photo after loading —
 *    same mental model as Templates.
 *  - No compression: typical documents are 1-3 KB; base64-encoded JSON
 *    fits comfortably under common URL limits without pulling pako
 *    (~12 KB minified) into the bundle.
 *  - Defence in depth: even if a hand-edited hash claims to carry a
 *    photo, the decoder strips it again before validation.
 */

/** Versioning so future format changes can fail loudly instead of garbling. */
const SHARE_VERSION = 1;
/** Conservative cap — 32 KB encoded covers any realistic stripped doc. */
const MAX_ENCODED_LENGTH = 32 * 1024;

interface SharePayload {
  v: number;
  doc: EditorDocument;
}

/** Wraps `btoa` to produce URL-safe base64 (RFC 4648 §5). */
function base64UrlEncode(str: string): string {
  // First UTF-8 encode so non-ASCII text (Cyrillic, emoji) survives btoa,
  // which only accepts Latin-1.
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]!);
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(encoded: string): string {
  const padded = encoded
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(encoded.length + ((4 - (encoded.length % 4)) % 4), '=');
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** Strip the background image and its companion manual transform. */
function stripImage(doc: EditorDocument): EditorDocument {
  return {
    ...doc,
    background: { ...doc.background, dataUrl: null, manual: null },
  };
}

/**
 * Encode a document into a hash fragment string (without the leading `#`).
 * Returns null if the encoded payload would exceed `MAX_ENCODED_LENGTH`
 * — shouldn't happen for stripped documents, but guards against future
 * additions that bloat the schema.
 */
export function encodeDocumentToHash(doc: EditorDocument): string | null {
  const payload: SharePayload = { v: SHARE_VERSION, doc: stripImage(doc) };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  if (encoded.length > MAX_ENCODED_LENGTH) return null;
  return encoded;
}

/**
 * Decode a hash fragment back into a document. Returns null for any
 * malformed input — caller can show a generic "invalid link" toast.
 * Always strips the image again as defence-in-depth, even if a
 * hand-edited hash tries to smuggle one in.
 */
export function decodeDocumentFromHash(hash: string): EditorDocument | null {
  if (!hash || hash.length > MAX_ENCODED_LENGTH) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(base64UrlDecode(hash));
  } catch {
    return null;
  }
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    (parsed as { v?: unknown }).v !== SHARE_VERSION
  ) {
    return null;
  }
  const doc = (parsed as { doc?: unknown }).doc;
  if (!isEditorDocument(doc)) return null;
  return stripImage(doc);
}

/** Full shareable URL for the given document at the current origin. */
export function buildShareUrl(doc: EditorDocument): string | null {
  const encoded = encodeDocumentToHash(doc);
  if (!encoded) return null;
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#mint=${encoded}`;
}

/** Read & decode the `#mint=...` fragment from the current URL, if any. */
export function readShareFromLocation(): EditorDocument | null {
  if (typeof window === 'undefined') return null;
  const m = window.location.hash.match(/[#&]mint=([A-Za-z0-9_-]+)/);
  if (!m || !m[1]) return null;
  return decodeDocumentFromHash(m[1]);
}

/** Remove the `mint=` fragment without adding a history entry. */
export function clearShareFromLocation(): void {
  if (typeof window === 'undefined') return;
  const cleaned = window.location.hash.replace(/[#&]?mint=[A-Za-z0-9_-]+/, '');
  const newHash = cleaned.replace(/^#?/, '');
  const url =
    window.location.pathname +
    window.location.search +
    (newHash ? `#${newHash}` : '');
  window.history.replaceState(null, '', url);
}
