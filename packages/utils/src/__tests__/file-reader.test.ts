import { describe, it, expect } from 'vitest';
import {
  ImageRejectedError,
  readImageFileSafely,
  MAX_IMAGE_BYTES,
} from '../file-reader';

const PNG_MAGIC = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
const JPEG_MAGIC = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]);
const WEBP_MAGIC = Uint8Array.from([
  // RIFF....WEBPVP8L (12 bytes: 'RIFF', 4 size bytes, 'WEBP')
  0x52, 0x49, 0x46, 0x46, 0x10, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);

function imageFile(
  magic: Uint8Array,
  mime: string,
  options: { sizeAfterMagic?: number; nameExt?: string } = {},
): File {
  const sizeAfter = options.sizeAfterMagic ?? 64;
  const combined = new Uint8Array(magic.length + sizeAfter);
  combined.set(magic, 0);
  // The DOM lib types BlobPart as needing `ArrayBufferView<ArrayBuffer>`
  // (not `<ArrayBufferLike>`) — cast through Blob to side-step that bound.
  const blob = new Blob([combined.buffer as ArrayBuffer], { type: mime });
  return new File([blob], `sample.${options.nameExt ?? mime.split('/')[1]}`, {
    type: mime,
  });
}

describe('readImageFileSafely', () => {
  it('rejects empty files', async () => {
    const file = new File([], 'empty.png', { type: 'image/png' });
    await expect(readImageFileSafely(file)).rejects.toMatchObject({
      name: 'ImageRejectedError',
      code: 'empty',
    });
  });

  it('rejects oversize files', async () => {
    const big = new Uint8Array(MAX_IMAGE_BYTES + 1);
    big.set(PNG_MAGIC, 0);
    const file = new File([big], 'big.png', { type: 'image/png' });
    await expect(readImageFileSafely(file)).rejects.toMatchObject({
      name: 'ImageRejectedError',
      code: 'size',
    });
  });

  it('rejects MIME types outside the whitelist', async () => {
    const file = new File([new Uint8Array(64)], 'doc.pdf', {
      type: 'application/pdf',
    });
    await expect(readImageFileSafely(file)).rejects.toMatchObject({
      name: 'ImageRejectedError',
      code: 'mime',
    });
  });

  it('rejects a PNG with PDF-like magic bytes (declared png, real pdf)', async () => {
    // %PDF magic — would slip past a pure MIME check.
    const pdfMagic = Uint8Array.from([0x25, 0x50, 0x44, 0x46]);
    const file = new File([pdfMagic, new Uint8Array(60)], 'fake.png', {
      type: 'image/png',
    });
    await expect(readImageFileSafely(file)).rejects.toMatchObject({
      name: 'ImageRejectedError',
      code: 'magic',
    });
  });

  it('rejects an SVG with image/svg+xml MIME (off the whitelist)', async () => {
    const file = new File(
      [
        '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
      ],
      'evil.svg',
      { type: 'image/svg+xml' },
    );
    await expect(readImageFileSafely(file)).rejects.toMatchObject({
      name: 'ImageRejectedError',
      code: 'mime',
    });
  });

  it('passes magic-byte check for a JPEG with correct header', async () => {
    // We expect the function to reach `readFileAsDataUrl`. FileReader isn't
    // available in the node test env, so we assert the failure code is
    // `read-failed` rather than any of the validation codes — this proves
    // all three validation steps (size, mime, magic) accepted the file.
    const file = imageFile(JPEG_MAGIC, 'image/jpeg', { nameExt: 'jpg' });
    let caught: unknown;
    try {
      await readImageFileSafely(file);
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(ImageRejectedError);
    expect((caught as ImageRejectedError).code).toBe('read-failed');
  });

  it('passes magic-byte check for a PNG with correct header', async () => {
    const file = imageFile(PNG_MAGIC, 'image/png');
    let caught: unknown;
    try {
      await readImageFileSafely(file);
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(ImageRejectedError);
    expect((caught as ImageRejectedError).code).toBe('read-failed');
  });

  it('passes magic-byte check for a WebP with correct RIFF/WEBP header', async () => {
    const file = imageFile(WEBP_MAGIC, 'image/webp');
    let caught: unknown;
    try {
      await readImageFileSafely(file);
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(ImageRejectedError);
    expect((caught as ImageRejectedError).code).toBe('read-failed');
  });
});
