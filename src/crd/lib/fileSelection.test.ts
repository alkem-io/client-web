import { describe, expect, test, vi } from 'vitest';
import {
  acceptsFile,
  FileUploadRejection,
  type LeftOutReason,
  MAX_CONCURRENT_UPLOADS,
  MAX_FILES_PER_SELECTION,
  selectFiles,
} from './fileSelection';

const makeFile = (name: string) => new File(['x'], name);
const makeFiles = (count: number) => Array.from({ length: count }, (_, i) => makeFile(`file-${i + 1}.pdf`));

describe('selectFiles', () => {
  test('keeps the first 25 in input order and reports the 26th as over the limit', () => {
    const files = makeFiles(26);
    const { kept, leftOut } = selectFiles(files, () => null);

    expect(kept).toEqual(files.slice(0, 25));
    expect(leftOut).toEqual([{ name: 'file-26.pdf', reason: { kind: 'limit' } }]);
  });

  test('a non-null check moves the file to leftOut with that reason, the others stay in order', () => {
    const files = makeFiles(4);
    const sizeReason: LeftOutReason = { kind: 'size', maxBytes: 10 };
    const { kept, leftOut } = selectFiles(files, file => (file.name === 'file-2.pdf' ? sizeReason : null));

    expect(kept).toEqual([files[0], files[2], files[3]]);
    expect(leftOut).toEqual([{ name: 'file-2.pdf', reason: sizeReason }]);
  });

  test('files past the cap are never passed to check', () => {
    const files = makeFiles(30);
    const check = vi.fn((_file: File) => null);
    selectFiles(files, check);

    expect(check).toHaveBeenCalledTimes(25);
    expect(check.mock.calls.map(([file]) => file)).toEqual(files.slice(0, 25));
  });

  test('an empty input returns two empty lists', () => {
    expect(selectFiles([], () => null)).toEqual({ kept: [], leftOut: [] });
  });
});

describe('acceptsFile', () => {
  test('accepts every file when accept is undefined', () => {
    expect(acceptsFile(makeFile('anything.xyz'), undefined)).toBe(true);
    expect(acceptsFile(makeFile('no-extension'), undefined)).toBe(true);
  });

  test('matches the extension case-insensitively against a comma list, spaces allowed', () => {
    expect(acceptsFile(makeFile('report.PDF'), '.pdf,.docx')).toBe(true);
    expect(acceptsFile(makeFile('report.docx'), '.pdf , .DOCX')).toBe(true);
  });

  test('rejects an unlisted extension and a file without one', () => {
    expect(acceptsFile(makeFile('image.png'), '.pdf,.docx')).toBe(false);
    expect(acceptsFile(makeFile('README'), '.pdf,.docx')).toBe(false);
  });
});

describe('FileUploadRejection', () => {
  test('carries its reason and is an Error', () => {
    const rejection = new FileUploadRejection({ kind: 'size', maxBytes: 10 });
    expect(rejection.reason).toEqual({ kind: 'size', maxBytes: 10 });
    expect(rejection).toBeInstanceOf(Error);
  });
});

describe('limits', () => {
  test('25 files per selection, three uploads at a time', () => {
    expect(MAX_FILES_PER_SELECTION).toBe(25);
    expect(MAX_CONCURRENT_UPLOADS).toBe(3);
  });
});
