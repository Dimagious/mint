import type {
  EditorDocument,
  TextLayerData,
  TextStyle,
  TextShadow,
  TextStroke,
  TextBackground,
  BackgroundData,
} from '@mint/core';
import { CANVAS_PRESETS } from '@mint/core';

/**
 * Defence-in-depth validation for a document parsed from a user-supplied
 * file (or localStorage). The previous version checked shape only —
 * `fontSize: 1e9`, `text: <50MB string>`, or `dataUrl: "javascript:..."`
 * would all pass. This pass adds numeric bounds, length caps, a color
 * regex, and a dataURL prefix check so a hand-edited project file can't
 * crash the canvas or surface a JS-URL in any code path that might one
 * day forget to sanitise.
 *
 * Why not zod: zod is ~12KB minified at runtime and adds a learning
 * curve for contributors. Our schema is one document we control; a
 * focused hand-rolled validator with explicit bounds keeps the bundle
 * lean and the schema readable in one file.
 */

const PRESET_IDS: ReadonlySet<string> = new Set(
  CANVAS_PRESETS.map((p) => p.id),
);

// Bounds picked to match (and slightly exceed) what the UI exposes —
// allowing values just past the UI limits keeps round-trip imports lossless,
// while still defeating absurd values that could OOM or stall a canvas.
const BOUNDS = {
  fontSize: { min: 1, max: 2000 },
  fontWeight: { min: 100, max: 900 },
  opacity: { min: 0, max: 1 },
  lineHeight: { min: 0.1, max: 10 },
  letterSpacing: { min: -200, max: 500 },
  coordinate: { min: -10_000, max: 10_000 },
  dimension: { min: 0, max: 10_000 },
  rotation: { min: -360, max: 360 },
  shadowOffset: { min: -200, max: 200 },
  shadowBlur: { min: 0, max: 200 },
  strokeWidth: { min: 0, max: 100 },
  bgPadding: { min: 0, max: 200 },
  bgRadius: { min: 0, max: 500 },
  textLen: { max: 4096 },
  fontFamilyLen: { max: 200 },
  colorLen: { max: 32 },
  /** 25 MB hard ceiling — accommodates a 15 MB image after base64 inflation. */
  dataUrlLen: { max: 25 * 1024 * 1024 },
  /** Layer id is `layer-<timestamp>-<counter>` — 128 is generous. */
  idLen: { max: 128 },
  /** Same cap as the undo history. */
  layerCount: { max: 100 },
} as const;

const COLOR_RE = /^(#[0-9a-fA-F]{3,8}|rgba?\([^)]{0,80}\)|transparent)$/;
const DATAURL_RE = /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isBoundedNumber(
  value: unknown,
  bounds: { min: number; max: number },
): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= bounds.min &&
    value <= bounds.max
  );
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isColorString(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= BOUNDS.colorLen.max &&
    COLOR_RE.test(value)
  );
}

function isTextShadow(value: unknown): value is TextShadow {
  if (!isRecord(value)) return false;
  return (
    isBoundedNumber(value.offsetX, BOUNDS.shadowOffset) &&
    isBoundedNumber(value.offsetY, BOUNDS.shadowOffset) &&
    isBoundedNumber(value.blur, BOUNDS.shadowBlur) &&
    isColorString(value.color)
  );
}

function isTextStroke(value: unknown): value is TextStroke {
  if (!isRecord(value)) return false;
  return (
    isBoundedNumber(value.width, BOUNDS.strokeWidth) &&
    isColorString(value.color)
  );
}

function isTextBackground(value: unknown): value is TextBackground {
  if (!isRecord(value)) return false;
  return (
    isColorString(value.color) &&
    isBoundedNumber(value.padding, BOUNDS.bgPadding) &&
    isBoundedNumber(value.borderRadius, BOUNDS.bgRadius)
  );
}

function isTextAlign(value: unknown): value is TextStyle['textAlign'] {
  return value === 'left' || value === 'center' || value === 'right';
}

function isTextStyle(value: unknown): value is TextStyle {
  if (!isRecord(value)) return false;
  return (
    typeof value.fontFamily === 'string' &&
    value.fontFamily.length > 0 &&
    value.fontFamily.length <= BOUNDS.fontFamilyLen.max &&
    isBoundedNumber(value.fontSize, BOUNDS.fontSize) &&
    isBoundedNumber(value.fontWeight, BOUNDS.fontWeight) &&
    isColorString(value.color) &&
    isBoundedNumber(value.opacity, BOUNDS.opacity) &&
    isTextAlign(value.textAlign) &&
    isBoundedNumber(value.lineHeight, BOUNDS.lineHeight) &&
    isBoundedNumber(value.letterSpacing, BOUNDS.letterSpacing) &&
    (value.shadow === null || isTextShadow(value.shadow)) &&
    (value.stroke === null || isTextStroke(value.stroke)) &&
    (value.background === null || isTextBackground(value.background))
  );
}

function isTextLayer(value: unknown): value is TextLayerData {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    value.id.length <= BOUNDS.idLen.max &&
    typeof value.text === 'string' &&
    value.text.length <= BOUNDS.textLen.max &&
    isBoundedNumber(value.x, BOUNDS.coordinate) &&
    isBoundedNumber(value.y, BOUNDS.coordinate) &&
    isBoundedNumber(value.width, BOUNDS.dimension) &&
    isBoundedNumber(value.height, BOUNDS.dimension) &&
    isBoundedNumber(value.rotation, BOUNDS.rotation) &&
    isTextStyle(value.style) &&
    isBoolean(value.visible) &&
    isBoolean(value.locked)
  );
}

function isDataUrl(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length <= BOUNDS.dataUrlLen.max &&
    DATAURL_RE.test(value)
  );
}

function isBackgroundTransform(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    isBoundedNumber(value.x, BOUNDS.coordinate) &&
    isBoundedNumber(value.y, BOUNDS.coordinate) &&
    // Scale is bounded between 1% and 1000% — generous, but defeats
    // pathologically tiny / huge values that would crash fabric.
    isBoundedNumber(value.scale, { min: 0.01, max: 10 })
  );
}

function isBackground(value: unknown): value is BackgroundData {
  if (!isRecord(value)) return false;
  if (!(value.dataUrl === null || isDataUrl(value.dataUrl))) return false;
  if (!(value.fit === 'contain' || value.fit === 'cover')) return false;
  if (!isColorString(value.color)) return false;
  // `manual` is optional / nullable; when present, must be a valid transform.
  if (
    value.manual !== undefined &&
    value.manual !== null &&
    !isBackgroundTransform(value.manual)
  ) {
    return false;
  }
  return true;
}

export function isEditorDocument(value: unknown): value is EditorDocument {
  if (!isRecord(value)) return false;
  return (
    typeof value.presetId === 'string' &&
    PRESET_IDS.has(value.presetId) &&
    isBackground(value.background) &&
    Array.isArray(value.layers) &&
    value.layers.length <= BOUNDS.layerCount.max &&
    value.layers.every(isTextLayer)
  );
}
