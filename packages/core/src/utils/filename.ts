import type { CanvasPresetId } from '../types/canvas-preset';
import type { ExportFormat } from '../types/export';

export function generateExportFilename(
  presetId: CanvasPresetId,
  format: ExportFormat,
): string {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, 19);
  const ext = format === 'jpeg' ? 'jpg' : 'png';
  return `dy-captionforge_${presetId}_${timestamp}.${ext}`;
}
