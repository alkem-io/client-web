import { describe, expect, it } from 'vitest';
import { type CalloutWithFramingTags, countTagOccurrences } from '../calloutTagCount';

const callout = (tags: string[] | null | undefined): CalloutWithFramingTags => ({
  framing: { profile: { tagset: tags === undefined ? undefined : tags === null ? null : { tags } } },
});

describe('countTagOccurrences', () => {
  it('returns an empty record for an empty list', () => {
    expect(countTagOccurrences([])).toEqual({});
  });

  it('counts a single callout with multiple tags', () => {
    expect(countTagOccurrences([callout(['design', 'ux', 'figma'])])).toEqual({
      design: 1,
      ux: 1,
      figma: 1,
    });
  });

  it('tallies the same tag across multiple callouts', () => {
    expect(countTagOccurrences([callout(['design', 'ux']), callout(['design']), callout(['ux', 'figma'])])).toEqual({
      design: 2,
      ux: 2,
      figma: 1,
    });
  });

  it('ignores callouts whose framing profile has no tagset (undefined / null)', () => {
    expect(
      countTagOccurrences([callout(['design']), callout(undefined), callout(null), callout(['design', 'ux'])])
    ).toEqual({ design: 2, ux: 1 });
  });

  it('treats empty tag arrays as no contribution', () => {
    expect(countTagOccurrences([callout(['design']), callout([])])).toEqual({ design: 1 });
  });

  it('reads only `framing.profile.tagset.tags` — never the classification tagsets', () => {
    // Simulate a callout that has both user-authored tags AND a classification.tagsets payload
    // (FLOW_STATE etc.). The helper must NOT count classification-tagset values.
    const withClassification = {
      framing: { profile: { tagset: { tags: ['design'] } } },
      // intentional `classification` field — the helper's input type doesn't read this; this
      // is just defensive evidence that the type contract is strict to framing.profile.tagset.
      classification: { tagsets: [{ name: 'FLOW_STATE', tags: ['discover'] }] },
    } as unknown as CalloutWithFramingTags;
    expect(countTagOccurrences([withClassification])).toEqual({ design: 1 });
  });

  it('preserves tag casing (no normalisation) — matches how the cloud renders chips', () => {
    expect(countTagOccurrences([callout(['Design', 'design'])])).toEqual({ Design: 1, design: 1 });
  });
});
