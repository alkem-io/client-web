import { describe, expect, it } from 'vitest';
import { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import { deriveCollaboraDocumentDisplayName } from './deriveCollaboraDocumentDisplayName';

describe('deriveCollaboraDocumentDisplayName', () => {
  describe('blank-create branch', () => {
    it('returns displayName + documentType from the provided post title and type', () => {
      const result = deriveCollaboraDocumentDisplayName({
        mode: 'blank-create',
        postTitle: 'Q3 Plan',
        documentType: CollaboraDocumentType.Wordprocessing,
      });
      expect(result).toEqual({
        displayName: 'Q3 Plan',
        documentType: CollaboraDocumentType.Wordprocessing,
      });
    });

    it('passes empty title through unchanged (form validation rejects empty title elsewhere)', () => {
      const result = deriveCollaboraDocumentDisplayName({
        mode: 'blank-create',
        postTitle: '',
        documentType: CollaboraDocumentType.Spreadsheet,
      });
      expect(result).toEqual({
        displayName: '',
        documentType: CollaboraDocumentType.Spreadsheet,
      });
    });
  });

  describe('upload branch — typed-vs-prefill decision', () => {
    it('returns empty {} when post title equals the auto-prefilled value (server derives from filename)', () => {
      const result = deriveCollaboraDocumentDisplayName({
        mode: 'upload',
        postTitle: 'Q3-Plan-final',
        autoPrefilledTitle: 'Q3-Plan-final',
      });
      expect(result).toEqual({});
    });

    it('returns { displayName } when post title differs from auto-prefilled value', () => {
      const result = deriveCollaboraDocumentDisplayName({
        mode: 'upload',
        postTitle: 'My Q3 Doc',
        autoPrefilledTitle: 'Q3-Plan-final',
      });
      expect(result).toEqual({ displayName: 'My Q3 Doc' });
    });

    it('returns { displayName } when no auto-prefill was captured (autoPrefilledTitle absent)', () => {
      const result = deriveCollaboraDocumentDisplayName({
        mode: 'upload',
        postTitle: 'Author-typed Title',
      });
      expect(result).toEqual({ displayName: 'Author-typed Title' });
    });

    it('treats character-for-character retype of the prefill as still equal (returns {})', () => {
      // Edge case from spec: author types over prefill, then types it back identically.
      const result = deriveCollaboraDocumentDisplayName({
        mode: 'upload',
        postTitle: 'budget-2026',
        autoPrefilledTitle: 'budget-2026',
      });
      expect(result).toEqual({});
    });
  });
});
