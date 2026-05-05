import { describe, expect, it } from 'vitest';
import { COLLABORA_IMPORT_MAX_BYTES } from './collaboraImportFormats';
import { validateCollaboraImportFile } from './validateCollaboraImportFile';

const makeFile = (name: string, sizeBytes: number, type = 'application/octet-stream'): File => {
  const file = new File([new Uint8Array(0)], name, { type });
  Object.defineProperty(file, 'size', { value: sizeBytes });
  return file;
};

describe('validateCollaboraImportFile', () => {
  it('rejects an empty file list with kind="no-file"', () => {
    const result = validateCollaboraImportFile([]);
    expect(result).toEqual({ ok: false, error: { kind: 'no-file' } });
  });

  it('rejects more than one file with kind="multiple-files"', () => {
    const a = makeFile('a.docx', 100);
    const b = makeFile('b.xlsx', 100);
    const result = validateCollaboraImportFile([a, b]);
    expect(result).toEqual({ ok: false, error: { kind: 'multiple-files' } });
  });

  it('rejects a folder-like entry (zero bytes, no extension, empty MIME) with kind="folder"', () => {
    const folder = makeFile('myFolder', 0, '');
    const result = validateCollaboraImportFile([folder]);
    expect(result).toEqual({ ok: false, error: { kind: 'folder' } });
  });

  it.each([
    ['.pdf', 'report.pdf'],
    ['.doc', 'legacy.doc'],
    ['.odt', 'opendoc.odt'],
    ['.txt', 'notes.txt'],
    ['.png', 'image.png'],
    ['.odg', 'drawing.odg'],
  ])('rejects unsupported extension %s with kind="extension"', (ext, name) => {
    const file = makeFile(name, 1000);
    const result = validateCollaboraImportFile([file]);
    expect(result).toEqual({ ok: false, error: { kind: 'extension', received: ext } });
  });

  it('matches extensions case-insensitively (uppercase .DOCX accepted)', () => {
    const file = makeFile('REPORT.DOCX', 1000);
    const result = validateCollaboraImportFile([file]);
    expect(result.ok).toBe(true);
  });

  it('matches extensions case-insensitively (mixed case .Pptx accepted)', () => {
    const file = makeFile('deck.Pptx', 1000);
    const result = validateCollaboraImportFile([file]);
    expect(result.ok).toBe(true);
  });

  describe('size cap (15 MB)', () => {
    it('accepts a file at one byte under the cap', () => {
      const file = makeFile('q3.docx', COLLABORA_IMPORT_MAX_BYTES - 1);
      const result = validateCollaboraImportFile([file]);
      expect(result.ok).toBe(true);
    });

    it('accepts a file exactly at the cap', () => {
      const file = makeFile('q3.docx', COLLABORA_IMPORT_MAX_BYTES);
      const result = validateCollaboraImportFile([file]);
      expect(result.ok).toBe(true);
    });

    it('rejects a file one byte over the cap with kind="size"', () => {
      const file = makeFile('q3.docx', COLLABORA_IMPORT_MAX_BYTES + 1);
      const result = validateCollaboraImportFile([file]);
      expect(result).toEqual({
        ok: false,
        error: { kind: 'size', bytes: COLLABORA_IMPORT_MAX_BYTES + 1, maxBytes: COLLABORA_IMPORT_MAX_BYTES },
      });
    });
  });

  it('returns { ok: true, file } on a valid .docx', () => {
    const file = makeFile('q3.docx', 1000);
    const result = validateCollaboraImportFile([file]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.file).toBe(file);
    }
  });

  it('returns { ok: true, file } on a valid .xlsx', () => {
    const file = makeFile('budget.xlsx', 50_000);
    const result = validateCollaboraImportFile([file]);
    expect(result.ok).toBe(true);
  });

  it('returns { ok: true, file } on a valid .pptx', () => {
    const file = makeFile('deck.pptx', 200_000);
    const result = validateCollaboraImportFile([file]);
    expect(result.ok).toBe(true);
  });

  it('checks single-file before extension (multi-file with one valid name still rejected)', () => {
    const a = makeFile('valid.docx', 100);
    const b = makeFile('invalid.pdf', 100);
    const result = validateCollaboraImportFile([a, b]);
    expect(result).toEqual({ ok: false, error: { kind: 'multiple-files' } });
  });

  it('checks extension before size (oversized .pdf rejected on extension, not size)', () => {
    const file = makeFile('huge.pdf', COLLABORA_IMPORT_MAX_BYTES + 100);
    const result = validateCollaboraImportFile([file]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('extension');
  });
});
