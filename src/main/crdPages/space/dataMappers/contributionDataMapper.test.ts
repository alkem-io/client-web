import { describe, expect, it } from 'vitest';
import { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import { mapAnyContributionToCardData } from './contributionDataMapper';

describe('mapAnyContributionToCardData', () => {
  it('returns undefined when the item carries none of the five contribution shapes', () => {
    expect(mapAnyContributionToCardData({ id: 'contribution-0' })).toBeUndefined();
  });

  it.each([
    [CollaboraDocumentType.Wordprocessing, 'text'],
    [CollaboraDocumentType.Spreadsheet, 'spreadsheet'],
    [CollaboraDocumentType.Presentation, 'presentation'],
    // Drawing collapses to the same generic 'text' preview type as Wordprocessing —
    // existing toCollaboraPreviewType behavior, unchanged by this story.
    [CollaboraDocumentType.Drawing, 'text'],
  ] as const)('maps a %s collaboraDocument contribution to type=document, documentType=%s', (serverType, expected) => {
    const result = mapAnyContributionToCardData({
      id: 'contribution-1',
      collaboraDocument: {
        id: 'doc-1',
        documentType: serverType,
        createdDate: new Date('2026-01-01T00:00:00Z'),
        createdBy: {
          id: 'user-1',
          profile: { displayName: 'Ada Lovelace', avatar: { uri: 'https://example.com/a.png' } },
        },
        profile: { id: 'profile-1', url: '/documents/doc-1', displayName: 'Q1 Report' },
      },
    });

    expect(result).toEqual({
      id: 'contribution-1',
      type: 'document',
      title: 'Q1 Report',
      href: '/documents/doc-1',
      documentId: 'doc-1',
      documentType: expected,
      author: { name: 'Ada Lovelace', avatarUrl: 'https://example.com/a.png' },
      createdDate: expect.any(String),
    });
  });

  it('omits author when createdBy has no profile', () => {
    const result = mapAnyContributionToCardData({
      id: 'contribution-2',
      collaboraDocument: {
        id: 'doc-2',
        documentType: CollaboraDocumentType.Spreadsheet,
        profile: { displayName: 'Untitled Spreadsheet' },
      },
    });

    expect(result?.author).toBeUndefined();
    expect(result?.documentId).toBe('doc-2');
  });
});
