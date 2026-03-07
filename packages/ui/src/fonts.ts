export interface FontEntry {
  family: string;
  category: 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';
}

export const GOOGLE_FONTS: FontEntry[] = [
  { family: 'Roboto', category: 'sans-serif' },
  { family: 'Open Sans', category: 'sans-serif' },
  { family: 'Montserrat', category: 'sans-serif' },
  { family: 'Lato', category: 'sans-serif' },
  { family: 'Poppins', category: 'sans-serif' },
  { family: 'Inter', category: 'sans-serif' },
  { family: 'Raleway', category: 'sans-serif' },
  { family: 'Nunito', category: 'sans-serif' },
  { family: 'Ubuntu', category: 'sans-serif' },
  { family: 'Rubik', category: 'sans-serif' },
  { family: 'Work Sans', category: 'sans-serif' },
  { family: 'Fira Sans', category: 'sans-serif' },
  { family: 'Oswald', category: 'sans-serif' },
  { family: 'Playfair Display', category: 'serif' },
  { family: 'Merriweather', category: 'serif' },
  { family: 'Lora', category: 'serif' },
  { family: 'PT Serif', category: 'serif' },
  { family: 'Libre Baskerville', category: 'serif' },
  { family: 'Bebas Neue', category: 'display' },
  { family: 'Comfortaa', category: 'display' },
  { family: 'Lobster', category: 'display' },
  { family: 'Pacifico', category: 'handwriting' },
  { family: 'Dancing Script', category: 'handwriting' },
  { family: 'Caveat', category: 'handwriting' },
  { family: 'Great Vibes', category: 'handwriting' },
  { family: 'Fira Code', category: 'monospace' },
  { family: 'JetBrains Mono', category: 'monospace' },
  { family: 'Source Code Pro', category: 'monospace' },
];

export const SYSTEM_FONTS: FontEntry[] = [
  { family: 'Arial', category: 'sans-serif' },
  { family: 'Georgia', category: 'serif' },
  { family: 'Times New Roman', category: 'serif' },
  { family: 'Courier New', category: 'monospace' },
  { family: 'Verdana', category: 'sans-serif' },
  { family: 'Impact', category: 'display' },
];

export const ALL_FONTS: FontEntry[] = [...SYSTEM_FONTS, ...GOOGLE_FONTS];

const loadedFonts = new Set<string>();

export function loadGoogleFont(family: string): void {
  if (loadedFonts.has(family)) return;
  if (SYSTEM_FONTS.some((f) => f.family === family)) return;

  loadedFonts.add(family);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@300;400;600;700;900&display=swap`;
  document.head.appendChild(link);
}

export function preloadAllGoogleFonts(): void {
  const families = GOOGLE_FONTS.map(
    (f) => `family=${encodeURIComponent(f.family)}:wght@400;700`,
  ).join('&');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  document.head.appendChild(link);

  for (const f of GOOGLE_FONTS) {
    loadedFonts.add(f.family);
  }
}
