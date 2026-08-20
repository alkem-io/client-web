import { describe, expect, it } from 'vitest';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { mapCalloutToDeletionSummary } from './mapCalloutToDeletionSummary';

// Feature 114 (Option A): the summary is built exclusively from data the callout's
// standard load already carries (contribution title stubs ride the `CalloutDetails`
// fragment) — the mapper is pure and never fetches.

const baseCallout = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'callout-1',
    framing: { type: 'None', profile: { references: [] } },
    contributions: [],
    comments: undefined,
    ...overrides,
  }) as unknown as CalloutDetailsModelExtended;

const framing = (fields: Record<string, unknown>) => ({ type: 'None', profile: { references: [] }, ...fields });

const titled = (displayName: string) => ({ id: `e-${displayName}`, profile: { id: `p-${displayName}`, displayName } });

describe('mapCalloutToDeletionSummary', () => {
  it('yields zero counts / empty lists for an empty callout', () => {
    expect(mapCalloutToDeletionSummary(baseCallout())).toEqual({
      contributionCount: 0,
      contributions: [],
      richContent: undefined,
      links: [],
      commentCount: 0,
    });
  });

  it('extracts contribution titles from every entity stub kind, sorted by sortOrder', () => {
    const callout = baseCallout({
      contributions: [
        { id: 'c-wb', sortOrder: 3, whiteboard: titled('Board') },
        { id: 'c-post', sortOrder: 1, post: titled('Idea') },
        { id: 'c-doc', sortOrder: 5, collaboraDocument: titled('Doc') },
        { id: 'c-link', sortOrder: 2, link: { id: 'l1', uri: 'https://a.io', profile: { displayName: 'A link' } } },
        { id: 'c-memo', sortOrder: 4, memo: titled('Note') },
      ],
    });

    const summary = mapCalloutToDeletionSummary(callout);
    expect(summary.contributionCount).toBe(5);
    expect(summary.contributions).toEqual([
      { id: 'c-post', label: 'Idea' },
      { id: 'c-link', label: 'A link' },
      { id: 'c-wb', label: 'Board' },
      { id: 'c-memo', label: 'Note' },
      { id: 'c-doc', label: 'Doc' },
    ]);
  });

  it('carries the description preview when the profile has one, omitting empty descriptions', () => {
    const callout = baseCallout({
      contributions: [
        {
          id: 'c1',
          sortOrder: 1,
          post: { id: 'p1', profile: { id: 'pp1', displayName: 'Idea', description: 'Some **markdown**' } },
        },
        { id: 'c2', sortOrder: 2, memo: { id: 'm1', profile: { id: 'mp1', displayName: 'Note', description: '' } } },
      ],
    });

    expect(mapCalloutToDeletionSummary(callout).contributions).toEqual([
      { id: 'c1', label: 'Idea', description: 'Some **markdown**' },
      { id: 'c2', label: 'Note', description: undefined },
    ]);
  });

  it('falls back to the URI for unnamed link contributions and filters unnameable items — count stays authoritative', () => {
    const callout = baseCallout({
      contributions: [
        { id: 'c-link', sortOrder: 1, link: { id: 'l1', uri: 'https://bare.link', profile: { displayName: '' } } },
        { id: 'c-stub', sortOrder: 2 }, // no entity stub at all (partial data)
      ],
    });

    const summary = mapCalloutToDeletionSummary(callout);
    expect(summary.contributions).toEqual([{ id: 'c-link', label: 'https://bare.link' }]);
    expect(summary.contributionCount).toBe(2);
  });

  it('derives each rich-content kind with whiteboard > memo > poll > mediaGallery > document precedence', () => {
    const kinds: Array<[Record<string, unknown>, string]> = [
      [{ whiteboard: { id: 'wb' }, memo: { id: 'm' } }, 'whiteboard'],
      [{ memo: { id: 'm' }, poll: { id: 'p' } }, 'memo'],
      [{ poll: { id: 'p' }, mediaGallery: { id: 'mg' } }, 'poll'],
      [{ mediaGallery: { id: 'mg' }, collaboraDocument: { id: 'd' } }, 'mediaGallery'],
      [{ collaboraDocument: { id: 'd' } }, 'document'],
    ];
    for (const [framingFields, expected] of kinds) {
      expect(mapCalloutToDeletionSummary(baseCallout({ framing: framing(framingFields) })).richContent).toBe(expected);
    }
    // A framing link body is surfaced via `links`, not `richContent`.
    const linkBody = baseCallout({
      framing: framing({ link: { uri: 'https://a.io', profile: { displayName: 'A' } } }),
    });
    expect(mapCalloutToDeletionSummary(linkBody).richContent).toBeUndefined();
  });

  it('routes a link-framing body to callToAction (not the links list)', () => {
    const callout = baseCallout({
      framing: framing({
        type: 'LINK',
        link: { id: 'cta-1', uri: 'https://action.io', profile: { displayName: 'Visit our site' } },
      }),
    });

    const summary = mapCalloutToDeletionSummary(callout);
    expect(summary.callToAction).toEqual({ id: 'cta-1', label: 'Visit our site' });
    expect(summary.links).toEqual([]);
    expect(summary.richContent).toBeUndefined();
  });

  it('collects the framing link and references as labelled links, falling back to the URL', () => {
    const callout = baseCallout({
      framing: framing({
        link: { uri: 'https://body.link', profile: { displayName: '' } },
        profile: {
          references: [
            { id: 'ref-1', name: 'Handbook', uri: 'https://handbook.io' },
            { id: 'ref-2', name: '', uri: 'https://unnamed.io' },
          ],
        },
      }),
    });

    expect(mapCalloutToDeletionSummary(callout).links).toEqual([
      // Framing link first (source order), label falls back to the URI, id falls back to a stable slug.
      { id: 'framing-link', label: 'https://body.link' },
      { id: 'ref-1', label: 'Handbook' },
      { id: 'ref-2', label: 'https://unnamed.io' },
    ]);
  });

  it('keeps the framing link id when present and filters out entries with no usable label', () => {
    const callout = baseCallout({
      framing: framing({
        link: { id: 'link-9', uri: 'https://body.link', profile: { displayName: 'Body link' } },
        profile: { references: [{ id: 'ref-empty', name: '', uri: '' }] },
      }),
    });

    expect(mapCalloutToDeletionSummary(callout).links).toEqual([{ id: 'link-9', label: 'Body link' }]);
  });

  it('reads the comment count from comments.messagesCount', () => {
    const callout = baseCallout({ comments: { messagesCount: 7 } });
    expect(mapCalloutToDeletionSummary(callout).commentCount).toBe(7);
  });
});
