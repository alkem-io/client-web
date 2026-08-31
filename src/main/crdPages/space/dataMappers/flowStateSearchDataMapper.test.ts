import { describe, expect, it } from 'vitest';
import { SearchResultType } from '@/core/apollo/generated/graphql-schema';
import { buildFlowStateSearchTerms, mapFlowStateSearchCalloutIds } from './flowStateSearchDataMapper';

describe('buildFlowStateSearchTerms', () => {
  it('returns an empty array for no text and no tags (browse mode)', () => {
    expect(buildFlowStateSearchTerms('', [])).toEqual([]);
  });

  it('treats whitespace-only text as no text', () => {
    expect(buildFlowStateSearchTerms('  ', ['Policy'])).toEqual(['Policy']);
  });

  it('returns one term for text alone', () => {
    expect(buildFlowStateSearchTerms('climate', [])).toEqual(['climate']);
  });

  it('joins text and tags into exactly one term', () => {
    expect(buildFlowStateSearchTerms('climate', ['Policy', 'Solar'])).toEqual(['climate Policy Solar']);
  });

  it('never exceeds one term and never drops a tag, even with a long text and many tags', () => {
    const longText = Array.from({ length: 12 }, (_, i) => `word${i}`).join(' ');
    const manyTags = Array.from({ length: 12 }, (_, i) => `tag${i}`);

    const terms = buildFlowStateSearchTerms(longText, manyTags);

    expect(terms).toHaveLength(1);
    for (const tag of manyTags) {
      expect(terms[0]).toContain(tag);
    }
  });
});

describe('mapFlowStateSearchCalloutIds', () => {
  it('extracts callout ids from callout-type results, in server order', () => {
    const results = [
      { type: SearchResultType.Callout, callout: { id: 'callout-1' } },
      { type: SearchResultType.Callout, callout: { id: 'callout-2' } },
    ] as unknown as Parameters<typeof mapFlowStateSearchCalloutIds>[0];

    expect(mapFlowStateSearchCalloutIds(results)).toEqual(['callout-1', 'callout-2']);
  });

  it('filters out non-callout results (type guard)', () => {
    const results = [
      { type: SearchResultType.Callout, callout: { id: 'callout-1' } },
      { type: 'SPACE', space: { id: 'space-1' } },
    ] as unknown as Parameters<typeof mapFlowStateSearchCalloutIds>[0];

    expect(mapFlowStateSearchCalloutIds(results)).toEqual(['callout-1']);
  });
});
