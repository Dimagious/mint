export type ExportFormat = 'png' | 'jpeg';

export interface ExportOptions {
  readonly format: ExportFormat;
  readonly quality: number;
}
