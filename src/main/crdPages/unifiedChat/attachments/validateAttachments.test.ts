import { describe, expect, test } from 'vitest';
import { MAX_ATTACHMENT_SIZE_BYTES, MAX_ATTACHMENTS_PER_MESSAGE, validateAttachments } from './validateAttachments';

const makeFile = (name: string, type: string, size: number): File => {
  const file = new File(['x'], name, { type });
  // jsdom derives size from the blob parts; override to simulate large files.
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('validateAttachments', () => {
  test('accepts allowed image/document types within the size cap', () => {
    const files = [makeFile('a.png', 'image/png', 1000), makeFile('b.pdf', 'application/pdf', 2000)];
    const result = validateAttachments(files, { existingCount: 0 });
    expect(result.accepted).toHaveLength(2);
    expect(result.rejected).toHaveLength(0);
  });

  test('rejects unsupported (executable/unknown) types', () => {
    const files = [makeFile('evil.exe', 'application/x-msdownload', 1000)];
    const result = validateAttachments(files, { existingCount: 0 });
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toEqual([{ fileName: 'evil.exe', reason: 'unsupportedType' }]);
  });

  test('rejects files with an empty / unknown MIME type (no allow-list bypass)', () => {
    const files = [makeFile('mystery', '', 1000)];
    const result = validateAttachments(files, { existingCount: 0 });
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toEqual([{ fileName: 'mystery', reason: 'unsupportedType' }]);
  });

  test('rejects SVG by default (dropped from the safe allow-list)', () => {
    const files = [makeFile('vector.svg', 'image/svg+xml', 1000)];
    const result = validateAttachments(files, { existingCount: 0 });
    expect(result.rejected).toEqual([{ fileName: 'vector.svg', reason: 'unsupportedType' }]);
  });

  test('rejects files over 50 MiB', () => {
    const files = [makeFile('huge.png', 'image/png', MAX_ATTACHMENT_SIZE_BYTES + 1)];
    const result = validateAttachments(files, { existingCount: 0 });
    expect(result.rejected).toEqual([{ fileName: 'huge.png', reason: 'tooLarge' }]);
  });

  test('rejects files beyond the 10-attachment cap, counting already-staged ones', () => {
    const files = Array.from({ length: 4 }, (_v, i) => makeFile(`f${i}.png`, 'image/png', 10));
    const result = validateAttachments(files, { existingCount: MAX_ATTACHMENTS_PER_MESSAGE - 2 });
    expect(result.accepted).toHaveLength(2);
    expect(result.rejected).toHaveLength(2);
    expect(result.rejected.every(r => r.reason === 'tooMany')).toBe(true);
  });

  test('honours a bucket-provided allowed-type list over the default', () => {
    const files = [makeFile('a.png', 'image/png', 10)];
    const result = validateAttachments(files, { existingCount: 0, allowedMimeTypes: ['application/pdf'] });
    expect(result.rejected).toEqual([{ fileName: 'a.png', reason: 'unsupportedType' }]);
  });
});
