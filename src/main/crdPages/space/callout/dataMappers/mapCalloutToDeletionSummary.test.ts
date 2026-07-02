import { describe, expect, it } from 'vitest';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { mapCalloutToDeletionSummary } from './mapCalloutToDeletionSummary';

// Feature 114 (Option A): the summary is built exclusively from fields the
// `CalloutDetails` fragment already caches — the mapper is pure and never fetches.

const baseCallout = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'callout-1',
    framing: { type: 'None', profile: { references: [] } },
    contributions: [],
    comments: undefined,
    ...overrides,
  }) as unknown as CalloutDetailsModelExtended;

const framing = (fields: Record<string, unknown>) => ({ type: 'None', profile: { references: [] }, ...fields });

describe('mapCalloutToDeletionSummary', () => {
  it('counts contributions and yields zero counts / empty links for an empty callout', () => {
    expect(mapCalloutToDeletionSummary(baseCallout())).toEqual({
      contributionCount: 0,
      richContent: undefined,
      links: [],
      commentCount: 0,
    });

    const withContributions = baseCallout({ contributions: [{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }] });
    expect(mapCalloutToDeletionSummary(withContributions).contributionCount).toBe(3);
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
