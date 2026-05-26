export type ExportFormat = 'png' | 'jpeg' | 'webp';

export interface ExportOptions {
  readonly format: ExportFormat;
  readonly quality: number;
}
