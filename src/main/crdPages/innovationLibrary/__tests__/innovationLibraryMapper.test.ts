import { describe, expect, it } from 'vitest';
import { mapPackToInnovationPackCardData, packTemplateCount } from '../innovationLibraryMapper';

type GqlLibraryPack = Parameters<typeof mapPackToInnovationPackCardData>[0];

const buildPack = (over?: Partial<GqlLibraryPack>): GqlLibraryPack =>
  ({
    id: 'pack-lib-1',
    profile: {
      displayName: 'Workshop Pack',
      description: 'Templates for facilitating workshops.',
      url: '/innovation-library/workshop-pack',
      tagset: { tags: ['workshop', 'facilitation'] },
    },
    provider: {
      profile: {
        displayName: 'Acme Org',
        url: '/organization/acme',
        avatar: { uri: 'https://cdn.example/acme.png' },
      },
    },
    templatesSet: {
      calloutTemplatesCount: 3,
      spaceTemplatesCount: 1,
      communityGuidelinesTemplatesCount: 0,
      postTemplatesCount: 5,
      whiteboardTemplatesCount: 2,
    },
    ...over,
  }) as unknown as GqlLibraryPack;

// ---------------------------------------------------------------------------
// packTemplateCount
// ---------------------------------------------------------------------------

describe('packTemplateCount', () => {
  it('sums the per-type counts on templatesSet', () => {
    expect(packTemplateCount(buildPack())).toBe(11);
  });

  it('returns zero when templatesSet is missing', () => {
    expect(packTemplateCount(buildPack({ templatesSet: null } as unknown as Partial<GqlLibraryPack>))).toBe(0);
  });

  it('treats nullish per-type counts as zero (additive)', () => {
    expect(
      packTemplateCount(
        buildPack({
          templatesSet: {
            calloutTemplatesCount: undefined,
            spaceTemplatesCount: null,
            communityGuidelinesTemplatesCount: 0,
            postTemplatesCount: 4,
            whiteboardTemplatesCount: undefined,
          },
        } as unknown as Partial<GqlLibraryPack>)
      )
    ).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// mapPackToInnovationPackCardData
// ---------------------------------------------------------------------------

describe('mapPackToInnovationPackCardData', () => {
  it('extracts the card display data (name, description, tags, url, provider)', () => {
    const card = mapPackToInnovationPackCardData(buildPack());
    expect(card).toMatchObject({
      id: 'pack-lib-1',
      name: 'Workshop Pack',
      description: 'Templates for facilitating workshops.',
      tags: ['workshop', 'facilitation'],
      url: '/innovation-library/workshop-pack',
      templateCount: 11,
      providerName: 'Acme Org',
      providerUrl: '/organization/acme',
      providerAvatarUrl: 'https://cdn.example/acme.png',
    });
  });

  it('leaves bannerUrl undefined — the library query has no pack banner, the card uses the deterministic colour gradient', () => {
    const card = mapPackToInnovationPackCardData(buildPack());
    expect(card.bannerUrl).toBeUndefined();
    // pickColorFromId is deterministic — sanity check the colour is a non-empty string.
    expect(typeof card.color).toBe('string');
    expect(card.color.length).toBeGreaterThan(0);
  });

  it('handles missing provider gracefully', () => {
    const card = mapPackToInnovationPackCardData(buildPack({ provider: null } as unknown as Partial<GqlLibraryPack>));
    expect(card.providerName).toBeUndefined();
    expect(card.providerAvatarUrl).toBeUndefined();
    expect(card.providerUrl).toBeUndefined();
  });

  it('handles missing description / tags / avatar', () => {
    const card = mapPackToInnovationPackCardData(
      buildPack({
        profile: {
          displayName: 'Bare Pack',
          url: '/p/bare',
        },
        provider: { profile: { displayName: 'Org' } },
      } as unknown as Partial<GqlLibraryPack>)
    );
    expect(card.description).toBe('');
    expect(card.tags).toEqual([]);
    expect(card.providerAvatarUrl).toBeUndefined();
  });

  it('is deterministic in the accent colour for a given id', () => {
    expect(mapPackToInnovationPackCardData(buildPack()).color).toBe(mapPackToInnovationPackCardData(buildPack()).color);
  });
});
