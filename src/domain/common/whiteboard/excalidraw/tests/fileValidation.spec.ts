import { describe, expect, test } from 'vitest';
import {
  filterImageMimeTypes,
  formatMaxFileSizeMb,
  getWhiteboardImageUploadI18nParams,
  validateWhiteboardImageFile,
} from '../fileStore/fileValidation';

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

  test('filters allowed mime types to image/*', () => {
    expect(filterImageMimeTypes(['application/pdf', 'image/png', 'image/jpeg'])).toEqual(['image/png', 'image/jpeg']);
  });

  test('formats max file size bytes as MB', () => {
    // 15 MiB
    expect(formatMaxFileSizeMb(15 * 1024 * 1024)).toBe('15 MB');
    // 1.5 MiB -> 1 decimal for small values
    expect(formatMaxFileSizeMb(1.5 * 1024 * 1024)).toBe('1.5 MB');
  });

  test('derives i18n params from validation result', () => {
    const validation = validateWhiteboardImageFile(createFile({ type: 'image/gif', size: 1 }), {
      allowedMimeTypes: ['application/pdf', 'image/png', 'image/webp'],
    });
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(getWhiteboardImageUploadI18nParams(validation)).toEqual({
        formats: 'image/png, image/webp',
      });
    }
  });
});
