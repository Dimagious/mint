import type { TextLayerData } from '@mint/core';

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 240;

function getMeasureContext(): CanvasRenderingContext2D | null {
  const canvas = window.document.createElement('canvas');
  return canvas.getContext('2d');
}

function measureLineWidth(
  ctx: CanvasRenderingContext2D,
  line: string,
  letterSpacing: number,
): number {
  if (!line) return 0;
  const measured = ctx.measureText(line).width;
  const spacing = Math.max(0, line.length - 1) * Math.max(0, letterSpacing);
  return measured + spacing;
}

function maxTextWidthForSize(layer: TextLayerData, fontSize: number): number {
  const ctx = getMeasureContext();
  if (!ctx) return Number.POSITIVE_INFINITY;

  ctx.font = `${layer.style.fontWeight} ${fontSize}px "${layer.style.fontFamily}", sans-serif`;
  const lines = layer.text.split('\n');
  const widths = lines.map((line) =>
    measureLineWidth(ctx, line, layer.style.letterSpacing),
  );
  return Math.max(...widths, 0);
}

export function calculateFitFontSize(layer: TextLayerData): number {
  const padding = layer.style.background?.padding ?? 0;
  const targetWidth = Math.max(40, layer.width - padding * 2);

  if (maxTextWidthForSize(layer, MIN_FONT_SIZE) > targetWidth) {
    return MIN_FONT_SIZE;
  }

  let low = MIN_FONT_SIZE;
  let high = MAX_FONT_SIZE;
  let best = layer.style.fontSize;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const width = maxTextWidthForSize(layer, mid);
    if (width <= targetWidth) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, best));
}
