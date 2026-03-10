import type { CanvasPreset, EditorDocument, TextLayerData } from '@mint/core';

export interface SmartContrastStyle {
  readonly color: string;
  readonly stroke: {
    readonly width: number;
    readonly color: string;
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function toLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function getLuminance(r: number, g: number, b: number): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function applyBackgroundFit(
  imgWidth: number,
  imgHeight: number,
  preset: CanvasPreset,
  fit: 'contain' | 'cover',
): { width: number; height: number; x: number; y: number } {
  const imgW = imgWidth || 1;
  const imgH = imgHeight || 1;
  const scale =
    fit === 'contain'
      ? Math.min(preset.width / imgW, preset.height / imgH)
      : Math.max(preset.width / imgW, preset.height / imgH);

  const width = imgW * scale;
  const height = imgH * scale;
  return {
    width,
    height,
    x: (preset.width - width) / 2,
    y: (preset.height - height) / 2,
  };
}

async function createComposedBackgroundCanvas(
  doc: EditorDocument,
  preset: CanvasPreset,
): Promise<HTMLCanvasElement | null> {
  const canvas = window.document.createElement('canvas');
  canvas.width = preset.width;
  canvas.height = preset.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = doc.background.color || '#e8f5ee';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!doc.background.dataUrl) {
    return canvas;
  }

  await new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const fitted = applyBackgroundFit(
        img.width,
        img.height,
        preset,
        doc.background.fit,
      );
      ctx.drawImage(img, fitted.x, fitted.y, fitted.width, fitted.height);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = doc.background.dataUrl!;
  });

  return canvas;
}

export async function calculateLayerBackgroundLuminance(
  doc: EditorDocument,
  preset: CanvasPreset,
  layer: TextLayerData,
): Promise<number> {
  const canvas = await createComposedBackgroundCanvas(doc, preset);
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return 0.5;

  const sx = clamp(Math.floor(layer.x), 0, preset.width - 1);
  const sy = clamp(Math.floor(layer.y), 0, preset.height - 1);
  const sw = clamp(Math.floor(layer.width), 1, preset.width - sx);
  const sh = clamp(Math.floor(layer.height), 1, preset.height - sy);

  const imageData = ctx.getImageData(sx, sy, sw, sh).data;
  const samplePixelStep = Math.max(1, Math.floor((sw * sh) / 4500));
  let sum = 0;
  let count = 0;

  for (let i = 0; i < imageData.length; i += 4 * samplePixelStep) {
    const r = imageData[i] ?? 0;
    const g = imageData[i + 1] ?? 0;
    const b = imageData[i + 2] ?? 0;
    sum += getLuminance(r, g, b);
    count += 1;
  }

  return count ? sum / count : 0.5;
}

export function getSmartContrastStyle(luminance: number): SmartContrastStyle {
  if (luminance > 0.62) {
    return {
      color: '#133a2d',
      stroke: { width: 1.5, color: '#ffffff' },
    };
  }

  if (luminance < 0.35) {
    return {
      color: '#f4fff9',
      stroke: { width: 1.5, color: '#0b3b2d' },
    };
  }

  return {
    color: '#0f4b39',
    stroke: { width: 1.5, color: '#f4fff9' },
  };
}
