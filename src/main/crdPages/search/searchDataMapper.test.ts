import { describe, expect, test, vi } from 'vitest';

// The generated schema module is huge; the mapper only needs the enum values.
vi.mock('@/core/apollo/generated/graphql-schema', () => ({
  SearchResultType: {
    Space: 'SPACE',
    Subspace: 'SUBSPACE',
    Callout: 'CALLOUT',
    Post: 'POST',
    Whiteboard: 'WHITEBOARD',
    Memo: 'MEMO',
    CollaboraDocument: 'COLLABORA_DOCUMENT',
    User: 'USER',
    Organization: 'ORGANIZATION',
  },
  VisualType: { Card: 'CARD' },
}));

import type { SearchResultMetaType } from '../../search/searchTypes';
import { mapPostResults, mapResponseResults, type SearchFallbackLabels } from './searchDataMapper';

const labels: SearchFallbackLabels = { unknown: 'Unknown', organization: 'Organization' };

const space = { about: { profile: { displayName: 'Engineering' } } };
const callout = { framing: { profile: { displayName: 'Roadmap' } } };

const collaboraDocumentResult = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'doc-1',
    type: 'COLLABORA_DOCUMENT',
    score: 1,
    terms: ['plan'],
    isContribution: false,
    space,
    callout,
    collaboraDocument: {
      id: 'cd-1',
      profile: {
        displayName: 'Quarterly Plan',
        url: '/spaces/eng/collabora/doc-1',
        // Present on the fragment, but MUST NOT leak into the card (FR-013).
        description: 'matched document body text',
      },
      createdBy: { profile: { displayName: 'Ada Lovelace' } },
      createdDate: new Date('2026-01-01'),
    },
    ...overrides,
  }) as unknown as SearchResultMetaType;

describe('mapPostResults — collabora documents (framing-placed)', () => {
  // US3 acceptance scenario 1: a document-content match renders as a standard
  // post-section card, openable in one action via the document's profile URL.
  test('maps a framing document onto the standard post card shape', () => {
    const [doc] = mapPostResults([], [collaboraDocumentResult()], labels);

    expect(doc).toMatchObject({
      id: 'doc-1',
      title: 'Quarterly Plan',
      type: 'collaboraDocument',
      author: { name: 'Ada Lovelace' },
      spaceName: 'Engineering',
      href: '/spaces/eng/collabora/doc-1',
    });
  });

  // FR-013: NO excerpt of the matched document text and NO match-source
  // indicator — the snippet stays empty even though the profile has a description.
  test('carries no excerpt (FR-013)', () => {
    const [doc] = mapPostResults([], [collaboraDocumentResult()], labels);

    expect(doc.snippet).toBe('');
  });
});

describe('mapResponseResults — collabora documents (contribution-placed)', () => {
  test('maps a contribution document with its owning Post context, still without excerpt', () => {
    const [doc] = mapResponseResults([collaboraDocumentResult({ isContribution: true })], labels);

    expect(doc).toMatchObject({
      id: 'doc-1',
      title: 'Quarterly Plan',
      type: 'collaboraDocument',
      parentPostTitle: 'Roadmap',
      spaceName: 'Engineering',
      href: '/spaces/eng/collabora/doc-1',
    });
    expect(doc.snippet).toBe('');
  });
});
