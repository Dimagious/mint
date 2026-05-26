import React, { useEffect, useRef } from 'react';
import type { CanvasPreset, EditorDocument } from '@mint/core';
import { ensureFontLoaded } from '@mint/ui';

interface TemplateThumbnailProps {
  document: EditorDocument;
  preset: CanvasPreset;
}

/**
 * Render a template into a small `<canvas>` for the gallery grid.
 *
 * We avoid spinning up a FabricAdapter for every thumbnail — at 12+
 * templates that would mean 12 hidden canvases each carrying its own
 * fabric instance. Instead, paint directly with the 2D context:
 * background colour fill, then each layer's text with the right font,
 * size, alignment, shadow and stroke. Fonts are pre-loaded via
 * `ensureFontLoaded` so the thumbnail matches what the loaded template
 * will look like in the real editor.
 */
export const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({
  document,
  preset,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cancelled = false;

    async function paint() {
      if (!ctx || cancelled) return;
      // Trigger loading the Google Fonts the template uses…
      await Promise.all(
        Array.from(
          new Set(
            document.layers.map(
              (l) => `${l.style.fontFamily}|${l.style.fontWeight}`,
            ),
          ),
        ).map((entry) => {
          const [family, weight] = entry.split('|');
          return ensureFontLoaded(family!, Number(weight));
        }),
      );
      // …then wait for the Document Fonts to actually become ready,
      // because the stylesheet links inserted by `loadGoogleFont` are
      // fetched asynchronously. Without this await the first paint
      // measures glyph widths against the fallback font and template
      // text wraps differently from how the editor will render it.
      if ('fonts' in window.document && window.document.fonts.ready) {
        try {
          await window.document.fonts.ready;
        } catch {
          /* ignore */
        }
      }
      if (cancelled || !ctx) return;

      ctx.clearRect(0, 0, preset.width, preset.height);
      ctx.fillStyle = document.background.color;
      ctx.fillRect(0, 0, preset.width, preset.height);

      for (const layer of document.layers) {
        if (!layer.visible) continue;
        ctx.save();
        ctx.globalAlpha = layer.style.opacity;
        ctx.fillStyle = layer.style.color;
        ctx.font = `${layer.style.fontWeight} ${layer.style.fontSize}px "${layer.style.fontFamily}", sans-serif`;
        ctx.textBaseline = 'top';
        ctx.textAlign = layer.style.textAlign;

        if (layer.style.shadow) {
          ctx.shadowColor = layer.style.shadow.color;
          ctx.shadowBlur = layer.style.shadow.blur;
          ctx.shadowOffsetX = layer.style.shadow.offsetX;
          ctx.shadowOffsetY = layer.style.shadow.offsetY;
        }

        const lineHeightPx = layer.style.lineHeight * layer.style.fontSize;
        const anchorX =
          layer.style.textAlign === 'center'
            ? layer.x + layer.width / 2
            : layer.style.textAlign === 'right'
              ? layer.x + layer.width
              : layer.x;
        // Greedy word-wrap so the thumbnail matches what Fabric's Textbox
        // produces inside the editor (where the layer width clamps lines).
        const lines = wrapText(ctx, layer.text, layer.width);
        lines.forEach((line, i) => {
          const y = layer.y + i * lineHeightPx;
          if (layer.style.stroke) {
            ctx.lineWidth = layer.style.stroke.width;
            ctx.strokeStyle = layer.style.stroke.color;
            ctx.strokeText(line, anchorX, y);
          }
          ctx.fillText(line, anchorX, y);
        });
        ctx.restore();
      }
    }

    void paint();
    return () => {
      cancelled = true;
    };
  }, [document, preset]);

  return (
    <canvas
      ref={canvasRef}
      width={preset.width}
      height={preset.height}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
      aria-hidden
    />
  );
};

/**
 * Greedy line-break: split each `\n`-delimited paragraph into lines that
 * fit `maxWidth` according to the current `ctx` font, using whitespace as
 * the break point. Falls back to placing an overlong single word on its
 * own line — we don't break mid-word in the thumbnail.
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const result: string[] = [];
  for (const paragraph of text.split('\n')) {
    const words = paragraph.split(/\s+/);
    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth) {
        line = candidate;
      } else {
        if (line) result.push(line);
        line = word;
      }
    }
    if (line) result.push(line);
  }
  return result;
}
