import type { EditorDocument } from '@mint/core';

export type TemplateCategory =
  | 'announcement'
  | 'quote'
  | 'promo'
  | 'social'
  | 'dev';

export interface LocalizedString {
  readonly en: string;
  readonly ru: string;
}

export interface TemplateEntry {
  readonly id: string;
  /** Short display label in the gallery; localised. */
  readonly name: LocalizedString;
  /** One-line description shown under the thumbnail. */
  readonly hint: LocalizedString;
  readonly category: TemplateCategory;
  /** Ready-to-load EditorDocument. Background images are *not* baked in
   *  — the user uploads their own photo after loading the template. */
  readonly document: EditorDocument;
}
