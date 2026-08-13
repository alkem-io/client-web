import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { deriveCollaboraImportErrorMessage } from './deriveCollaboraImportErrorMessage';

/**
 * Stand-in for the real `t` returned by `useTranslation('crd-space')`. Mirrors the exact
 * English copy in `space.en.json` for the four `documentImportError*` keys this helper uses,
 * so the test also pins the interpolated `{{formats}}` / `{{cap}}` values, not just the key.
 */
const messages: Record<string, string> = {
  documentImportErrorUnsupported: "This file type isn't supported. Try {{formats}}.",
  documentImportErrorTooLarge: 'File is too large. Maximum size is {{cap}} MB.',
  documentImportErrorMultiple: 'Drop a single file at a time.',
  documentImportErrorFolder: 'Drop a single file, not a folder.',
};

const tStub = ((key: string, options?: { formats?: string; cap?: number }): string => {
  const template = messages[key.replace('callout.', '')];
  if (!template) return key;
  return template.replace('{{formats}}', options?.formats ?? '').replace('{{cap}}', String(options?.cap ?? ''));
}) as unknown as TFunction<'crd-space'>;

describe('deriveCollaboraImportErrorMessage', () => {
  it('returns null for a null error', () => {
    expect(deriveCollaboraImportErrorMessage(null, tStub, '.docx, .xlsx, .pptx', 15)).toBeNull();
  });

  it('maps kind="extension" to the unsupported-format message with the format list interpolated', () => {
    const message = deriveCollaboraImportErrorMessage(
      { kind: 'extension', received: '.pdf' },
      tStub,
      '.docx, .xlsx, .pptx',
      15
    );
    expect(message).toBe("This file type isn't supported. Try .docx, .xlsx, .pptx.");
  });

  it('maps kind="size" to the too-large message with the cap interpolated', () => {
    const message = deriveCollaboraImportErrorMessage(
      { kind: 'size', bytes: 20 * 1024 * 1024, maxBytes: 15 * 1024 * 1024 },
      tStub,
      '.docx, .xlsx, .pptx',
      15
    );
    expect(message).toBe('File is too large. Maximum size is 15 MB.');
  });

  it('maps kind="multiple-files" to the single-file message', () => {
    const message = deriveCollaboraImportErrorMessage({ kind: 'multiple-files' }, tStub, '.docx, .xlsx, .pptx', 15);
    expect(message).toBe('Drop a single file at a time.');
  });

  it('maps kind="folder" to the not-a-folder message', () => {
    const message = deriveCollaboraImportErrorMessage({ kind: 'folder' }, tStub, '.docx, .xlsx, .pptx', 15);
    expect(message).toBe('Drop a single file, not a folder.');
  });
});
