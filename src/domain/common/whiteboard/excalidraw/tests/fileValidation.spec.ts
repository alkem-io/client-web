import { describe, expect, test } from 'vitest';
import { validateWhiteboardImageFile } from '../fileStore/fileValidation';

const createFile = ({ type, size }: { type: string; size: number }): File => {
  return new File([new Uint8Array(size)], 'file', { type });
};

describe('fileValidation', () => {
  test('rejects unsupported mime type', () => {
    const file = createFile({ type: 'image/gif', size: 100 });
    const result = validateWhiteboardImageFile(file, { allowedMimeTypes: ['image/png'] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('unsupportedMimeType');
    }
  });

  test('rejects oversize file', () => {
    const file = createFile({ type: 'image/png', size: 10 });
    const result = validateWhiteboardImageFile(file, { maxFileSizeBytes: 5 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('fileTooLarge');
    }
  });

  test('accepts supported mime type within size', () => {
    const file = createFile({ type: 'image/webp', size: 10 });
    const result = validateWhiteboardImageFile(file, { maxFileSizeBytes: 20 });
    expect(result).toEqual({ ok: true });
  });
});
