import type { EditorDocument } from '@mint/core';
import { layer } from './helpers';
import type { TemplateEntry } from './types';

/**
 * Curated set of templates modelled on the patterns that actually go
 * viral on Canva/Figma: quote posts, bold announcements, list-post
 * covers, stat highlights, sale banners, newsletter issues, launch
 * cards, testimonials, story-format quotes, reels covers, and tip
 * cards. Each template is a complete `EditorDocument` the editor can
 * `loadDocument(...)` directly.
 *
 * Backgrounds are deliberately solid colours — large base64 dataURLs
 * would balloon the bundle. The user adds their own photo on top after
 * loading the template; the layout still reads on the solid colour.
 */

function bg(color: string): EditorDocument['background'] {
  return { dataUrl: null, fit: 'cover', color };
}

/* ─── Square 1080 × 1080 ─────────────────────────────────────────────── */

const QUOTE_CLASSIC: EditorDocument = {
  presetId: 'square',
  background: bg('#FAFAF7'),
  layers: [
    layer({
      text: '"The best way to predict the future is to invent it."',
      x: 100,
      y: 380,
      width: 880,
      height: 280,
      style: {
        fontFamily: 'Playfair Display',
        fontWeight: 700,
        fontSize: 64,
        color: '#1A1D1B',
        textAlign: 'center',
        lineHeight: 1.25,
      },
    }),
    layer({
      text: '— Alan Kay',
      x: 100,
      y: 720,
      width: 880,
      height: 60,
      style: {
        fontFamily: 'Inter',
        fontWeight: 500,
        fontSize: 28,
        color: '#5E6764',
        textAlign: 'center',
        letterSpacing: 4,
      },
    }),
  ],
};

const ANNOUNCEMENT_BOLD: EditorDocument = {
  presetId: 'square',
  background: bg('#2F9F7A'),
  layers: [
    layer({
      text: 'NEW',
      x: 80,
      y: 220,
      width: 920,
      height: 120,
      style: {
        fontFamily: 'Bebas Neue',
        fontWeight: 400,
        fontSize: 96,
        color: '#FFFFFF',
        textAlign: 'left',
        letterSpacing: 8,
        opacity: 0.85,
      },
    }),
    layer({
      text: 'We just\nshipped\nsomething\nyou will love.',
      x: 80,
      y: 380,
      width: 920,
      height: 540,
      style: {
        fontFamily: 'Inter',
        fontWeight: 900,
        fontSize: 110,
        color: '#FFFFFF',
        textAlign: 'left',
        lineHeight: 1.05,
      },
    }),
    layer({
      text: 'Read the announcement →',
      x: 80,
      y: 940,
      width: 920,
      height: 60,
      style: {
        fontFamily: 'Inter',
        fontWeight: 500,
        fontSize: 28,
        color: '#FFFFFF',
        textAlign: 'left',
        opacity: 0.85,
      },
    }),
  ],
};

const LIST_FIVE_THINGS: EditorDocument = {
  presetId: 'square',
  background: bg('#1A1D1B'),
  layers: [
    layer({
      text: '5 THINGS',
      x: 80,
      y: 220,
      width: 920,
      height: 110,
      style: {
        fontFamily: 'Inter',
        fontWeight: 700,
        fontSize: 36,
        color: '#2F9F7A',
        textAlign: 'left',
        letterSpacing: 6,
      },
    }),
    layer({
      text: 'I wish I knew\nbefore I\nstarted out',
      x: 80,
      y: 330,
      width: 920,
      height: 540,
      style: {
        fontFamily: 'Inter',
        fontWeight: 800,
        fontSize: 110,
        color: '#FAFAF7',
        textAlign: 'left',
        lineHeight: 1.05,
      },
    }),
    layer({
      text: 'Swipe →',
      x: 80,
      y: 880,
      width: 920,
      height: 60,
      style: {
        fontFamily: 'Inter',
        fontWeight: 500,
        fontSize: 32,
        color: '#FAFAF7',
        textAlign: 'left',
        opacity: 0.7,
      },
    }),
  ],
};

const STAT_HIGHLIGHT: EditorDocument = {
  presetId: 'square',
  background: bg('#E6F3EC'),
  layers: [
    layer({
      text: 'OUR USERS SAVE',
      x: 80,
      y: 280,
      width: 920,
      height: 60,
      style: {
        fontFamily: 'Inter',
        fontWeight: 700,
        fontSize: 30,
        color: '#1F7459',
        textAlign: 'center',
        letterSpacing: 5,
      },
    }),
    layer({
      text: '4.5h',
      x: 80,
      y: 360,
      width: 920,
      height: 320,
      style: {
        fontFamily: 'Inter',
        fontWeight: 900,
        fontSize: 320,
        color: '#1F7459',
        textAlign: 'center',
        letterSpacing: -8,
      },
    }),
    layer({
      text: 'every week on social\nposts after switching to MINT.',
      x: 80,
      y: 720,
      width: 920,
      height: 180,
      style: {
        fontFamily: 'Inter',
        fontWeight: 500,
        fontSize: 36,
        color: '#1A1D1B',
        textAlign: 'center',
        lineHeight: 1.35,
      },
    }),
  ],
};

const PROMO_SALE: EditorDocument = {
  presetId: 'square',
  background: bg('#E26D5C'),
  layers: [
    layer({
      text: 'SUMMER SALE',
      x: 80,
      y: 200,
      width: 920,
      height: 80,
      style: {
        fontFamily: 'Inter',
        fontWeight: 700,
        fontSize: 36,
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: 8,
      },
    }),
    layer({
      text: '50% OFF',
      x: 80,
      y: 400,
      width: 920,
      height: 240,
      style: {
        fontFamily: 'Inter',
        fontWeight: 900,
        fontSize: 180,
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: 4,
      },
    }),
    layer({
      text: 'July 1 — 15  •  code MINT50',
      x: 80,
      y: 720,
      width: 920,
      height: 60,
      style: {
        fontFamily: 'Inter',
        fontWeight: 500,
        fontSize: 30,
        color: '#FFFFFF',
        textAlign: 'center',
        opacity: 0.9,
      },
    }),
  ],
};

const CAROUSEL_COVER: EditorDocument = {
  presetId: 'square',
  background: bg('#FAFAF7'),
  layers: [
    layer({
      text: 'CARRY-OVER POST',
      x: 80,
      y: 200,
      width: 920,
      height: 60,
      style: {
        fontFamily: 'Inter',
        fontWeight: 700,
        fontSize: 28,
        color: '#2F9F7A',
        textAlign: 'left',
        letterSpacing: 5,
      },
    }),
    layer({
      text: 'How we cut our\nbuild time by 60%',
      x: 80,
      y: 320,
      width: 920,
      height: 360,
      style: {
        fontFamily: 'Playfair Display',
        fontWeight: 700,
        fontSize: 120,
        color: '#1A1D1B',
        textAlign: 'left',
        lineHeight: 1.05,
      },
    }),
    layer({
      text: 'A practical guide  →',
      x: 80,
      y: 900,
      width: 920,
      height: 60,
      style: {
        fontFamily: 'Inter',
        fontWeight: 500,
        fontSize: 28,
        color: '#5E6764',
        textAlign: 'left',
      },
    }),
  ],
};

const NEWSLETTER_ISSUE: EditorDocument = {
  presetId: 'square',
  background: bg('#1F7459'),
  layers: [
    layer({
      text: 'ISSUE  №  042',
      x: 80,
      y: 240,
      width: 920,
      height: 60,
      style: {
        fontFamily: 'JetBrains Mono',
        fontWeight: 500,
        fontSize: 28,
        color: '#C9E4D6',
        textAlign: 'center',
        letterSpacing: 6,
      },
    }),
    layer({
      text: 'The Weekly\nBrief',
      x: 80,
      y: 340,
      width: 920,
      height: 380,
      style: {
        fontFamily: 'Playfair Display',
        fontWeight: 700,
        fontSize: 160,
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 1.0,
      },
    }),
    layer({
      text: 'Hand-picked engineering reads,\nevery Friday morning.',
      x: 80,
      y: 760,
      width: 920,
      height: 140,
      style: {
        fontFamily: 'Inter',
        fontWeight: 500,
        fontSize: 30,
        color: '#C9E4D6',
        textAlign: 'center',
        lineHeight: 1.35,
        opacity: 0.95,
      },
    }),
  ],
};

/* ─── Portrait 1080 × 1350 ───────────────────────────────────────────── */

const LAUNCH_DAY: EditorDocument = {
  presetId: 'portrait',
  background: bg('#1A1D1B'),
  layers: [
    layer({
      text: 'LAUNCHING TUESDAY',
      x: 80,
      y: 280,
      width: 920,
      height: 60,
      style: {
        fontFamily: 'Inter',
        fontWeight: 700,
        fontSize: 30,
        color: '#2F9F7A',
        textAlign: 'left',
        letterSpacing: 5,
      },
    }),
    layer({
      text: 'Something\nyou will\nactually use.',
      x: 80,
      y: 400,
      width: 920,
      height: 600,
      style: {
        fontFamily: 'Inter',
        fontWeight: 900,
        fontSize: 150,
        color: '#FAFAF7',
        textAlign: 'left',
        lineHeight: 1.05,
      },
    }),
    layer({
      text: 'Get the launch email at the link →',
      x: 80,
      y: 1180,
      width: 920,
      height: 60,
      style: {
        fontFamily: 'Inter',
        fontWeight: 500,
        fontSize: 30,
        color: '#FAFAF7',
        textAlign: 'left',
        opacity: 0.75,
      },
    }),
  ],
};

const ARTICLE_COVER: EditorDocument = {
  presetId: 'portrait',
  background: bg('#FAFAF7'),
  layers: [
    layer({
      text: 'ESSAY',
      x: 80,
      y: 320,
      width: 920,
      height: 60,
      style: {
        fontFamily: 'Inter',
        fontWeight: 700,
        fontSize: 28,
        color: '#2F9F7A',
        textAlign: 'left',
        letterSpacing: 6,
      },
    }),
    layer({
      text: 'Why state lives\nin the store, never\nin the canvas.',
      x: 80,
      y: 420,
      width: 920,
      height: 600,
      style: {
        fontFamily: 'Playfair Display',
        fontWeight: 700,
        fontSize: 110,
        color: '#1A1D1B',
        textAlign: 'left',
        lineHeight: 1.1,
      },
    }),
    layer({
      text: '— Dmitriy Yurkin   •   8 min read',
      x: 80,
      y: 1180,
      width: 920,
      height: 60,
      style: {
        fontFamily: 'Inter',
        fontWeight: 500,
        fontSize: 28,
        color: '#5E6764',
        textAlign: 'left',
      },
    }),
  ],
};

const TESTIMONIAL: EditorDocument = {
  presetId: 'portrait',
  background: bg('#E6F3EC'),
  layers: [
    layer({
      text: '“MINT replaced three tools\nin my weekly content flow.\nI’m never going back.”',
      x: 80,
      y: 380,
      width: 920,
      height: 480,
      style: {
        fontFamily: 'Playfair Display',
        fontWeight: 500,
        fontSize: 78,
        color: '#1A1D1B',
        textAlign: 'left',
        lineHeight: 1.2,
      },
    }),
    layer({
      text: 'ANNA — DEV ADVOCATE\nIndie Studio',
      x: 80,
      y: 1140,
      width: 920,
      height: 120,
      style: {
        fontFamily: 'Inter',
        fontWeight: 700,
        fontSize: 26,
        color: '#1F7459',
        textAlign: 'left',
        letterSpacing: 4,
        lineHeight: 1.4,
      },
    }),
  ],
};

/* ─── Story 1080 × 1920 ──────────────────────────────────────────────── */

const QUOTE_STORY: EditorDocument = {
  presetId: 'story',
  background: bg('#1A1D1B'),
  layers: [
    layer({
      text: '“Ship things you’d\nactually use yourself.”',
      x: 80,
      y: 720,
      width: 920,
      height: 540,
      style: {
        fontFamily: 'Playfair Display',
        fontWeight: 600,
        fontSize: 96,
        color: '#FAFAF7',
        textAlign: 'left',
        lineHeight: 1.2,
      },
    }),
    layer({
      text: '— RAYMOND CHEN',
      x: 80,
      y: 1340,
      width: 920,
      height: 60,
      style: {
        fontFamily: 'Inter',
        fontWeight: 700,
        fontSize: 28,
        color: '#2F9F7A',
        textAlign: 'left',
        letterSpacing: 8,
      },
    }),
  ],
};

const REELS_COVER: EditorDocument = {
  presetId: 'story',
  background: bg('#2F9F7A'),
  layers: [
    layer({
      text: 'WATCH\nUNTIL\nTHE\nEND.',
      x: 80,
      y: 700,
      width: 920,
      height: 920,
      style: {
        fontFamily: 'Inter',
        fontWeight: 900,
        fontSize: 200,
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 1.0,
        letterSpacing: 4,
      },
    }),
    layer({
      text: 'You won’t guess what happens.',
      x: 80,
      y: 1560,
      width: 920,
      height: 60,
      style: {
        fontFamily: 'Inter',
        fontWeight: 500,
        fontSize: 30,
        color: '#FFFFFF',
        textAlign: 'center',
        opacity: 0.85,
      },
    }),
  ],
};

const DAILY_TIP: EditorDocument = {
  presetId: 'story',
  background: bg('#FAFAF7'),
  layers: [
    layer({
      text: 'TIP OF THE DAY',
      x: 80,
      y: 220,
      width: 920,
      height: 60,
      style: {
        fontFamily: 'Inter',
        fontWeight: 700,
        fontSize: 30,
        color: '#2F9F7A',
        textAlign: 'left',
        letterSpacing: 6,
      },
    }),
    layer({
      text: 'Press T.\nThat is\nthe whole\nshortcut.',
      x: 80,
      y: 360,
      width: 920,
      height: 1100,
      style: {
        fontFamily: 'Inter',
        fontWeight: 900,
        fontSize: 160,
        color: '#1A1D1B',
        textAlign: 'left',
        lineHeight: 1.05,
      },
    }),
    layer({
      text: '— full shortcut list inside the editor.',
      x: 80,
      y: 1660,
      width: 920,
      height: 60,
      style: {
        fontFamily: 'Inter',
        fontWeight: 500,
        fontSize: 28,
        color: '#5E6764',
        textAlign: 'left',
      },
    }),
  ],
};

const NOW_PLAYING: EditorDocument = {
  presetId: 'story',
  background: bg('#1F7459'),
  layers: [
    layer({
      text: 'NOW PLAYING',
      x: 80,
      y: 1300,
      width: 920,
      height: 60,
      style: {
        fontFamily: 'Inter',
        fontWeight: 700,
        fontSize: 30,
        color: '#C9E4D6',
        textAlign: 'left',
        letterSpacing: 6,
        opacity: 0.85,
      },
    }),
    layer({
      text: 'Idea\non a Sunday',
      x: 80,
      y: 1400,
      width: 920,
      height: 280,
      style: {
        fontFamily: 'Playfair Display',
        fontWeight: 700,
        fontSize: 96,
        color: '#FFFFFF',
        textAlign: 'left',
        lineHeight: 1.1,
      },
    }),
    layer({
      text: 'first take · 3:42',
      x: 80,
      y: 1700,
      width: 920,
      height: 60,
      style: {
        fontFamily: 'JetBrains Mono',
        fontWeight: 500,
        fontSize: 28,
        color: '#C9E4D6',
        textAlign: 'left',
        letterSpacing: 4,
      },
    }),
  ],
};

/* ─── Catalogue ─────────────────────────────────────────────────────── */

export const TEMPLATES: readonly TemplateEntry[] = [
  // Square
  {
    id: 'quote-classic',
    name: { en: 'Quote', ru: 'Цитата' },
    hint: { en: 'Centered serif quote', ru: 'Цитата с засечками по центру' },
    category: 'quote',
    document: QUOTE_CLASSIC,
  },
  {
    id: 'announce-bold',
    name: { en: 'New: Bold', ru: 'Новость, крупно' },
    hint: { en: 'Big mint announcement', ru: 'Крупный мятный анонс' },
    category: 'announcement',
    document: ANNOUNCEMENT_BOLD,
  },
  {
    id: 'list-5-things',
    name: { en: '5 things', ru: '5 вещей' },
    hint: {
      en: 'Carousel cover for a list post',
      ru: 'Обложка карусели «5 вещей»',
    },
    category: 'social',
    document: LIST_FIVE_THINGS,
  },
  {
    id: 'stat-highlight',
    name: { en: 'Stat highlight', ru: 'Цифра в центре' },
    hint: { en: 'Big number with context', ru: 'Большая цифра с подписями' },
    category: 'announcement',
    document: STAT_HIGHLIGHT,
  },
  {
    id: 'promo-sale',
    name: { en: 'Sale banner', ru: 'Распродажа' },
    hint: { en: 'Discount + period', ru: 'Скидка + период' },
    category: 'promo',
    document: PROMO_SALE,
  },
  {
    id: 'carousel-cover',
    name: { en: 'Article cover', ru: 'Обложка статьи' },
    hint: {
      en: 'Serif heading + swipe hint',
      ru: 'Заголовок с засечками + подсказка свайпа',
    },
    category: 'social',
    document: CAROUSEL_COVER,
  },
  {
    id: 'newsletter-issue',
    name: { en: 'Newsletter', ru: 'Рассылка' },
    hint: { en: 'Issue number + title', ru: 'Номер выпуска + заголовок' },
    category: 'social',
    document: NEWSLETTER_ISSUE,
  },
  // Portrait
  {
    id: 'launch-day',
    name: { en: 'Launch day', ru: 'Запуск' },
    hint: { en: 'Tag + huge headline', ru: 'Тэг + крупный заголовок' },
    category: 'announcement',
    document: LAUNCH_DAY,
  },
  {
    id: 'article-cover',
    name: { en: 'Essay cover', ru: 'Обложка эссе' },
    hint: {
      en: 'Tagline + 3-line title + byline',
      ru: 'Кикер + 3 строки + автор',
    },
    category: 'social',
    document: ARTICLE_COVER,
  },
  {
    id: 'testimonial',
    name: { en: 'Testimonial', ru: 'Отзыв' },
    hint: { en: 'Quote + name & role', ru: 'Цитата + имя и роль' },
    category: 'quote',
    document: TESTIMONIAL,
  },
  // Story
  {
    id: 'quote-story',
    name: { en: 'Quote story', ru: 'Цитата для сторис' },
    hint: {
      en: 'Centered serif quote on dark',
      ru: 'Цитата с засечками на тёмном',
    },
    category: 'quote',
    document: QUOTE_STORY,
  },
  {
    id: 'reels-cover',
    name: { en: 'Reels cover', ru: 'Обложка Reels' },
    hint: { en: 'Bold 3-line hook', ru: 'Жирный 3-строчный хук' },
    category: 'social',
    document: REELS_COVER,
  },
  {
    id: 'daily-tip',
    name: { en: 'Tip of the day', ru: 'Совет дня' },
    hint: { en: 'Tag + bold tip', ru: 'Тэг + большой совет' },
    category: 'social',
    document: DAILY_TIP,
  },
  {
    id: 'now-playing',
    name: { en: 'Now playing', ru: 'Сейчас играет' },
    hint: { en: 'Player-style track card', ru: 'Карточка трека' },
    category: 'social',
    document: NOW_PLAYING,
  },
];
