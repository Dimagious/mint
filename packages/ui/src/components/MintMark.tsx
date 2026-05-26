import React from 'react';

interface MintMarkProps {
  /** Pixel size (square). Default 24. */
  size?: number;
  /** CSS color for the mark; uses `currentColor` by default. */
  color?: string;
  /** Decorative by default — pass `false` and a `title` to make it
   *  announce as an image. */
  decorative?: boolean;
  title?: string;
}

/**
 * Canonical MINT brand mark.
 *
 * A four-petal abstract leaf in a single colour. Use everywhere the brand
 * shows up — favicon, app-bar logo, empty-state hero — so the project
 * stops shipping three different "leaves" (favicon, header, empty-state).
 */
export const MintMark: React.FC<MintMarkProps> = ({
  size = 24,
  color,
  decorative = true,
  title,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    role={decorative ? 'presentation' : 'img'}
    aria-hidden={decorative || undefined}
    aria-label={!decorative ? title : undefined}
    style={color ? { color } : undefined}
  >
    {!decorative && title && <title>{title}</title>}
    <path
      d="M16 4c2.5 3.5 2.5 7 0 10-2.5-3-2.5-6.5 0-10z"
      fill="currentColor"
    />
    <path
      d="M28 16c-3.5 2.5-7 2.5-10 0 3-2.5 6.5-2.5 10 0z"
      fill="currentColor"
    />
    <path
      d="M16 28c-2.5-3.5-2.5-7 0-10 2.5 3 2.5 6.5 0 10z"
      fill="currentColor"
    />
    <path
      d="M4 16c3.5-2.5 7-2.5 10 0-3 2.5-6.5 2.5-10 0z"
      fill="currentColor"
    />
    <circle cx="16" cy="16" r="2.2" fill="currentColor" />
  </svg>
);
