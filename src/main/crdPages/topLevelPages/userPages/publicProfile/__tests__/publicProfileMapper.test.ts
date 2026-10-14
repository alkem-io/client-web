import { describe, expect, it } from 'vitest';
import {
  type AccountResourcesShape,
  mapAccountHostedResources,
} from '@/main/crdPages/topLevelPages/common/profileMapperHelpers';
import { buildUserProfileTagsets } from '../publicProfileMapper';

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

describe('mapAccountHostedResources', () => {
  const vcType = 'Virtual Contributor';

  it('returns three empty buckets when accountResources is null/undefined', () => {
    const empty = {
      hostedVirtualContributors: [],
      hostedInnovationPacks: [],
      hostedInnovationHubs: [],
    };
    expect(mapAccountHostedResources(undefined, vcType)).toEqual(empty);
    expect(mapAccountHostedResources(null, vcType)).toEqual(empty);
  });

  it('returns three empty buckets when collections are missing', () => {
    expect(mapAccountHostedResources({}, vcType)).toEqual({
      hostedVirtualContributors: [],
      hostedInnovationPacks: [],
      hostedInnovationHubs: [],
    });
  });

  it('maps hosted virtual contributors with the provided vcType label', () => {
    const resources: AccountResourcesShape = {
      virtualContributors: [
        {
          id: 'vc-1',
          profile: {
            displayName: 'AI Helper',
            url: '/vc/helper',
            tagline: 'Helps you',
            avatar: { uri: 'https://cdn.example/vc.jpg' },
          },
        },
        {
          id: 'vc-2',
          profile: { displayName: 'No Tagline', url: '/vc/notagline' },
        },
      ],
    };
    const result = mapAccountHostedResources(resources, vcType);
    expect(result.hostedVirtualContributors).toEqual([
      {
        id: 'vc-1',
        displayName: 'AI Helper',
        description: 'Helps you',
        type: 'Virtual Contributor',
        href: '/vc/helper',
        avatarImageUrl: 'https://cdn.example/vc.jpg',
      },
      {
        id: 'vc-2',
        displayName: 'No Tagline',
        description: null,
        type: 'Virtual Contributor',
        href: '/vc/notagline',
        avatarImageUrl: null,
      },
    ]);
  });

  it('drops virtual contributors whose `profile` is missing', () => {
    const resources: AccountResourcesShape = {
      virtualContributors: [
        { id: 'vc-1', profile: null },
        { id: 'vc-2', profile: { displayName: 'OK', url: '/ok' } },
      ],
    };
    expect(mapAccountHostedResources(resources, vcType).hostedVirtualContributors).toHaveLength(1);
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
    const result = mapAccountHostedResources(resources, vcType);
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
    const result = mapAccountHostedResources(resources, vcType);
    expect(result.hostedInnovationPacks).toHaveLength(1);
    expect(result.hostedInnovationPacks[0].id).toBe('p-2');
    expect(result.hostedInnovationHubs).toHaveLength(0);
  });
});
