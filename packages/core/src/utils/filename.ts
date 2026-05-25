import type { ExportFormat } from '../types/export';

const FORMAT_EXTENSION: Record<ExportFormat, string> = {
  png: 'png',
  jpeg: 'jpg',
  webp: 'webp',
};

export function generateExportFilename(format: ExportFormat): string {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, 19);
  return `mint_${timestamp}.${FORMAT_EXTENSION[format]}`;
}
