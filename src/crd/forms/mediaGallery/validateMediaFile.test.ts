/// <reference lib="dom" />
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { validateMediaFile } from './validateMediaFile';

type ImageMock = {
  width: number;
  height: number;
  shouldFail?: boolean;
};

let nextImageMock: ImageMock = { width: 1024, height: 768 };

class FakeImage {
  naturalWidth = 0;
  naturalHeight = 0;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  set src(_: string) {
    // Fire listeners asynchronously (matches real HTMLImageElement behaviour)
    queueMicrotask(() => {
      if (nextImageMock.shouldFail) {
        this.onerror?.();
        return;
      }
      this.naturalWidth = nextImageMock.width;
      this.naturalHeight = nextImageMock.height;
      this.onload?.();
    });
  }
}

const makeFile = (type: string): File => new File(['x'], `test.${type.split('/')[1]}`, { type });

beforeEach(() => {
  vi.stubGlobal('Image', FakeImage);
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:mock'),
    revokeObjectURL: vi.fn(),
  });
  nextImageMock = { width: 1024, height: 768 };
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('validateMediaFile', () => {
  it('returns { ok: true } for an unconstrained file', async () => {
    const file = makeFile('image/png');
    await expect(validateMediaFile(file)).resolves.toEqual({ ok: true });
  });

  it('rejects unsupported MIME types with reason=type', async () => {
    const file = makeFile('image/bmp');
    await expect(validateMediaFile(file, { allowedMimeTypes: ['image/png', 'image/jpeg'] })).resolves.toEqual({
      ok: false,
      reason: 'type',
    });
  });

  it('accepts HEIC regardless of other constraints (server converts)', async () => {
    for (const type of ['image/heic', 'image/heif']) {
      const file = makeFile(type);
      await expect(
        validateMediaFile(file, {
          allowedMimeTypes: ['image/png'],
          minWidth: 9999,
          maxWidth: 10,
        })
      ).resolves.toEqual({ ok: true });
    }
  });

  it('rejects images below minWidth/minHeight with reason=tooSmall', async () => {
    nextImageMock = { width: 100, height: 100 };
    const file = makeFile('image/png');
    await expect(
      validateMediaFile(file, { allowedMimeTypes: ['image/png'], minWidth: 200, minHeight: 200 })
    ).resolves.toEqual({ ok: false, reason: 'tooSmall' });
  });

  it('rejects images above maxWidth/maxHeight with reason=tooLarge', async () => {
    nextImageMock = { width: 5000, height: 5000 };
    const file = makeFile('image/png');
    await expect(
      validateMediaFile(file, { allowedMimeTypes: ['image/png'], maxWidth: 2000, maxHeight: 2000 })
    ).resolves.toEqual({ ok: false, reason: 'tooLarge' });
  });

  it('accepts images within bounds', async () => {
    nextImageMock = { width: 800, height: 600 };
    const file = makeFile('image/png');
    await expect(
      validateMediaFile(file, {
        allowedMimeTypes: ['image/png'],
        minWidth: 300,
        minHeight: 300,
        maxWidth: 2000,
        maxHeight: 2000,
      })
    ).resolves.toEqual({ ok: true });
  });

  it('treats decode failures as reason=type', async () => {
    nextImageMock = { width: 0, height: 0, shouldFail: true };
    const file = makeFile('image/png');
    await expect(validateMediaFile(file, { allowedMimeTypes: ['image/png'], minWidth: 100 })).resolves.toEqual({
      ok: false,
      reason: 'type',
    });
  });
});
