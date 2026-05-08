import { describe, expect, it } from 'vitest';
import { type AccountResourcesShape, buildUserProfileTagsets, mapHostedSpacesToCardData } from '../publicProfileMapper';

const tagsetLabels = { keywords: 'Keywords', skills: 'Skills' };

describe('buildUserProfileTagsets', () => {
  it('returns an empty array when tagsets is undefined', () => {
    expect(buildUserProfileTagsets(undefined, tagsetLabels)).toEqual([]);
  });

  it('returns an empty array when no reserved tagsets have tags', () => {
    expect(buildUserProfileTagsets([{ name: 'OTHER', tags: ['x'] }], tagsetLabels)).toEqual([]);
  });

  it('drops empty groups (FR: only render groups with at least one tag)', () => {
    const result = buildUserProfileTagsets(
      [
        { name: 'KEYWORDS', tags: ['react'] },
        { name: 'SKILLS', tags: [] },
      ],
      tagsetLabels
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ key: 'KEYWORDS', name: 'Keywords', tags: ['react'] });
  });

  it('case-insensitively matches reserved names', () => {
    const result = buildUserProfileTagsets(
      [
        { name: 'keywords', tags: ['ai'] },
        { name: 'Skills', tags: ['typescript'] },
      ],
      tagsetLabels
    );
    expect(result.map(g => g.key)).toEqual(['KEYWORDS', 'SKILLS']);
    expect(result.map(g => g.tags)).toEqual([['ai'], ['typescript']]);
  });

  it('uses the provided i18n labels for the rendered name', () => {
    const result = buildUserProfileTagsets([{ name: 'KEYWORDS', tags: ['a'] }], {
      keywords: 'Mots-clés',
      skills: 'Compétences',
    });
    expect(result[0].name).toBe('Mots-clés');
  });
});

describe('mapHostedSpacesToCardData', () => {
  const vcType = 'Virtual Contributor';

  it('returns four empty buckets when accountResources is null/undefined', () => {
    const empty = {
      hostedSpaces: [],
      hostedVirtualContributors: [],
      hostedInnovationPacks: [],
      hostedInnovationHubs: [],
    };
    expect(mapHostedSpacesToCardData(undefined, vcType)).toEqual(empty);
    expect(mapHostedSpacesToCardData(null, vcType)).toEqual(empty);
  });

  it('returns four empty buckets when collections are missing', () => {
    expect(mapHostedSpacesToCardData({}, vcType)).toEqual({
      hostedSpaces: [],
      hostedVirtualContributors: [],
      hostedInnovationPacks: [],
      hostedInnovationHubs: [],
    });
  });

  it('drops spaces whose `about.profile` is missing rather than crashing', () => {
    const resources: AccountResourcesShape = {
      spaces: [
        { id: 's-1', about: { profile: null, isContentPublic: true } },
        {
          id: 's-2',
          about: {
            profile: { displayName: 'Real Space', url: '/s/real' },
            isContentPublic: true,
          },
        },
      ],
    };
    const result = mapHostedSpacesToCardData(resources, vcType);
    expect(result.hostedSpaces).toHaveLength(1);
    expect(result.hostedSpaces[0].id).toBe('s-2');
  });

  it('maps a space with a banner — uses real banner over gradient fallback', () => {
    const resources: AccountResourcesShape = {
      spaces: [
        {
          id: 's-1',
          about: {
            profile: {
              displayName: 'Space One',
              url: '/s/one',
              tagline: 'A short tagline',
              cardBanner: { uri: 'https://cdn.example/banner.jpg' },
            },
            isContentPublic: true,
          },
        },
      ],
    };
    const result = mapHostedSpacesToCardData(resources, vcType);
    expect(result.hostedSpaces[0]).toMatchObject({
      id: 's-1',
      title: 'Space One',
      description: 'A short tagline',
      href: '/s/one',
      imageUrl: 'https://cdn.example/banner.jpg',
      isPrivate: false,
    });
    // Deterministic colour is always populated (fallback when banner is absent).
    expect(typeof result.hostedSpaces[0].color).toBe('string');
    expect(result.hostedSpaces[0].color.length).toBeGreaterThan(0);
  });

  it('marks isPrivate=true only when isContentPublic === false', () => {
    const make = (isContentPublic: boolean | undefined) => ({
      spaces: [
        {
          id: 's',
          about: {
            profile: { displayName: 'S', url: '/s' },
            isContentPublic,
          },
        },
      ],
    });
    expect(mapHostedSpacesToCardData(make(false), vcType).hostedSpaces[0].isPrivate).toBe(true);
    expect(mapHostedSpacesToCardData(make(true), vcType).hostedSpaces[0].isPrivate).toBe(false);
    // Undefined should NOT be treated as private — the public-default contract.
    expect(mapHostedSpacesToCardData(make(undefined), vcType).hostedSpaces[0].isPrivate).toBe(false);
  });

  it('produces a deterministic accent colour from the space id (`pickColorFromId` consistency)', () => {
    const resources: AccountResourcesShape = {
      spaces: [{ id: 'stable-id', about: { profile: { displayName: 'A', url: '/a' }, isContentPublic: true } }],
    };
    const c1 = mapHostedSpacesToCardData(resources, vcType).hostedSpaces[0].color;
    const c2 = mapHostedSpacesToCardData(resources, vcType).hostedSpaces[0].color;
    expect(c1).toBe(c2);
  });

  it('maps hosted virtual contributors with the provided vcType label', () => {
    const resources: AccountResourcesShape = {
      virtualContributors: [
        {
          id: 'vc-1',
          profile: { displayName: 'AI Helper', url: '/vc/helper', tagline: 'Helps you' },
        },
        {
          id: 'vc-2',
          profile: { displayName: 'No Tagline', url: '/vc/notagline' },
        },
      ],
    };
    const result = mapHostedSpacesToCardData(resources, vcType);
    expect(result.hostedVirtualContributors).toEqual([
      {
        id: 'vc-1',
        displayName: 'AI Helper',
        description: 'Helps you',
        type: 'Virtual Contributor',
        href: '/vc/helper',
      },
      { id: 'vc-2', displayName: 'No Tagline', description: null, type: 'Virtual Contributor', href: '/vc/notagline' },
    ]);
  });

  it('drops virtual contributors whose `profile` is missing', () => {
    const resources: AccountResourcesShape = {
      virtualContributors: [
        { id: 'vc-1', profile: null },
        { id: 'vc-2', profile: { displayName: 'OK', url: '/ok' } },
      ],
    };
    expect(mapHostedSpacesToCardData(resources, vcType).hostedVirtualContributors).toHaveLength(1);
  });

  it('maps innovation packs and hubs into SimpleResourceCardItem shape', () => {
    const resources: AccountResourcesShape = {
      innovationPacks: [
        {
          id: 'p-1',
          profile: {
            displayName: 'Pack A',
            url: '/p/a',
            tagline: 'pack tagline',
            avatar: { uri: 'https://cdn.example/p.jpg' },
          },
        },
      ],
      innovationHubs: [
        {
          id: 'h-1',
          profile: { displayName: 'Hub A', url: '/h/a' },
        },
      ],
    };
    const result = mapHostedSpacesToCardData(resources, vcType);
    expect(result.hostedInnovationPacks).toEqual([
      {
        id: 'p-1',
        displayName: 'Pack A',
        description: 'pack tagline',
        href: '/p/a',
        avatarImageUrl: 'https://cdn.example/p.jpg',
      },
    ]);
    expect(result.hostedInnovationHubs).toEqual([
      { id: 'h-1', displayName: 'Hub A', description: null, href: '/h/a', avatarImageUrl: null },
    ]);
  });

  it('drops innovation packs/hubs whose `profile` is missing rather than emitting nulls', () => {
    const resources: AccountResourcesShape = {
      innovationPacks: [
        { id: 'p-1', profile: null },
        { id: 'p-2', profile: { displayName: 'Real', url: '/real' } },
      ],
      innovationHubs: [{ id: 'h-1', profile: null }],
    };
    const result = mapHostedSpacesToCardData(resources, vcType);
    expect(result.hostedInnovationPacks).toHaveLength(1);
    expect(result.hostedInnovationPacks[0].id).toBe('p-2');
    expect(result.hostedInnovationHubs).toHaveLength(0);
  });
});
