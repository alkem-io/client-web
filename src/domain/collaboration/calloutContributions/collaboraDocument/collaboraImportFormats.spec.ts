import { describe, expect, it } from 'vitest';
import {
  COLLABORA_IMPORT_ACCEPT_ATTR,
  COLLABORA_IMPORT_EXTENSIONS_P1,
  COLLABORA_IMPORT_MAX_BYTES,
} from './collaboraImportFormats';

describe('collaboraImportFormats', () => {
  it('exposes the P1 extension list with .docx, .xlsx, .pptx, .pdf', () => {
    expect(COLLABORA_IMPORT_EXTENSIONS_P1).toEqual(['.docx', '.xlsx', '.pptx', '.pdf']);
  });

  it('caps uploads at exactly 15 MB', () => {
    expect(COLLABORA_IMPORT_MAX_BYTES).toBe(15 * 1024 * 1024);
    expect(COLLABORA_IMPORT_MAX_BYTES).toBe(15728640);
  });

  it('produces a comma-joined accept attribute matching the picker hint', () => {
    expect(COLLABORA_IMPORT_ACCEPT_ATTR).toBe('.docx,.xlsx,.pptx,.pdf');
  });

  it('includes PDF in P1 (import-only, no blank-create option — FR-001/FR-003)', () => {
    expect(COLLABORA_IMPORT_EXTENSIONS_P1).toContain('.pdf');
  });

  it('does not include legacy or ODF extensions in P1', () => {
    const banned = ['.doc', '.xls', '.ppt', '.odt', '.ods', '.odp', '.rtf', '.csv', '.odg'];
    for (const ext of banned) {
      expect(COLLABORA_IMPORT_EXTENSIONS_P1).not.toContain(ext);
    }
  });
});
