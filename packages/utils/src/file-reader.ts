export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as data URL'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Accepted MIME types for the background image upload. */
export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;
export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIMES)[number];

/** 15 MB — generous for a phone photo but bounds the dataURL we put in localStorage. */
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

/** Magic bytes for the three accepted image formats. */
const MAGIC_BYTES: Record<AllowedImageMime, (head: Uint8Array) => boolean> = {
  // JPEG starts with FF D8 FF
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  // PNG starts with 89 50 4E 47 0D 0A 1A 0A
  'image/png': (b) =>
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47 &&
    b[4] === 0x0d &&
    b[5] === 0x0a &&
    b[6] === 0x1a &&
    b[7] === 0x0a,
  // WebP is a RIFF container — bytes 0..3 are 'RIFF' and 8..11 are 'WEBP'
  'image/webp': (b) =>
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50,
};

export class ImageRejectedError extends Error {
  readonly code: 'mime' | 'size' | 'magic' | 'empty' | 'read-failed';
  constructor(code: ImageRejectedError['code'], message: string) {
    super(message);
    this.name = 'ImageRejectedError';
    this.code = code;
  }
}

/**
 * Read a user-supplied image file safely.
 *
 * The default upload path used `readFileAsDataUrl` directly, which would
 * happily accept a 500 MB binary or a `.svg` with embedded `<script>` tags
 * just because the OS labelled it as `image/*`. This wrapper enforces:
 *
 *  1. MIME whitelist — only `image/jpeg`, `image/png`, `image/webp`.
 *  2. Size cap — defaults to 15 MB; large enough for a high-res phone
 *     photo, small enough that the resulting dataURL stays under the
 *     localStorage quota and the canvas operations stay snappy.
 *  3. Magic-byte check — the first ~12 bytes must match the declared
 *     MIME. Stops attackers from renaming `.svg`/`.html`/`.exe` to `.jpg`
 *     to slip past the MIME filter.
 *
 * Rejects with an `ImageRejectedError` carrying a stable `code` so callers
 * can show locale-aware messages without parsing the `message` string.
 */
export async function readImageFileSafely(
  file: File,
  options: { maxBytes?: number } = {},
): Promise<string> {
  const maxBytes = options.maxBytes ?? MAX_IMAGE_BYTES;

  if (file.size === 0) {
    throw new ImageRejectedError('empty', 'File is empty');
  }
  if (file.size > maxBytes) {
    throw new ImageRejectedError(
      'size',
      `File is ${Math.round(file.size / (1024 * 1024))}MB; limit is ${Math.round(maxBytes / (1024 * 1024))}MB`,
    );
  }
  if (!isAllowedMime(file.type)) {
    throw new ImageRejectedError(
      'mime',
      `Unsupported file type: ${file.type || 'unknown'}`,
    );
  }

  // Magic-byte check on the first 16 bytes — enough to identify all three
  // supported formats and cheap to read.
  const headBuf = await file.slice(0, 16).arrayBuffer();
  const head = new Uint8Array(headBuf);
  const matcher = MAGIC_BYTES[file.type];
  if (!matcher || !matcher(head)) {
    throw new ImageRejectedError(
      'magic',
      `File contents do not match the declared type (${file.type})`,
    );
  }

  try {
    return await readFileAsDataUrl(file);
  } catch (cause) {
    throw new ImageRejectedError(
      'read-failed',
      `Failed to read file: ${cause instanceof Error ? cause.message : 'unknown'}`,
    );
  }
}

function isAllowedMime(mime: string): mime is AllowedImageMime {
  return (ALLOWED_IMAGE_MIMES as readonly string[]).includes(mime);
}
