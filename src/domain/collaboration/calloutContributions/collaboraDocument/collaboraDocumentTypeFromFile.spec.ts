import { describe, expect, it } from 'vitest';
import { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import { collaboraDocumentTypeFromFilename, isSameCollaboraDocumentType } from './collaboraDocumentTypeFromFile';

describe('collaboraDocumentTypeFromFilename', () => {
  it.each([
    ['report.docx', CollaboraDocumentType.Wordprocessing],
    ['budget.XLSX', CollaboraDocumentType.Spreadsheet],
    ['deck.pptx', CollaboraDocumentType.Presentation],
  ])('maps %s to its Collabora document type', (name, expected) => {
    expect(collaboraDocumentTypeFromFilename(name)).toBe(expected);
  });

  it.each(['notes.pdf', 'legacy.doc', 'noextension'])('returns undefined for unsupported %s', name => {
    expect(collaboraDocumentTypeFromFilename(name)).toBeUndefined();
  });
});

describe('isSameCollaboraDocumentType', () => {
  it('is true when the incoming extension matches the current type', () => {
    expect(isSameCollaboraDocumentType('new.docx', CollaboraDocumentType.Wordprocessing)).toBe(true);
    // the current type may arrive as a raw string from the callout model
    expect(isSameCollaboraDocumentType('new.xlsx', 'SPREADSHEET')).toBe(true);
  });

  it('is false when the incoming extension is a different type', () => {
    expect(isSameCollaboraDocumentType('new.xlsx', CollaboraDocumentType.Wordprocessing)).toBe(false);
  });

  it('is false for an unknown extension', () => {
    expect(isSameCollaboraDocumentType('new.pdf', CollaboraDocumentType.Wordprocessing)).toBe(false);
  });
});
