import { describe, expect, it } from 'vitest';
import {
  type AccountResourcesShape,
  type AssociateInput,
  mapAssociates,
  mapOrgHostedResources,
} from '../organizationProfileMapper';

describe('mapAssociates', () => {
  it('returns an empty array for an empty input', () => {
    expect(mapAssociates([])).toEqual([]);
  });

  it('renames `avatar` → `avatarImageUrl` and falls back to null when missing', () => {
    const input: AssociateInput[] = [
      { id: 'u-1', displayName: 'Alice', avatar: 'https://cdn.example/alice.png', url: '/u/alice' },
      { id: 'u-2', displayName: 'Bob', url: '/u/bob' },
    ];
    expect(mapAssociates(input)).toEqual([
      { id: 'u-1', displayName: 'Alice', avatarImageUrl: 'https://cdn.example/alice.png', url: '/u/alice' },
      { id: 'u-2', displayName: 'Bob', avatarImageUrl: null, url: '/u/bob' },
    ]);
  });

  it('preserves order', () => {
    const input: AssociateInput[] = [
      { id: 'u-1', displayName: 'A', url: '/a' },
      { id: 'u-2', displayName: 'B', url: '/b' },
      { id: 'u-3', displayName: 'C', url: '/c' },
    ];
    expect(mapAssociates(input).map(a => a.id)).toEqual(['u-1', 'u-2', 'u-3']);
  });
});

describe('mapOrgHostedResources', () => {
  const vcType = 'Virtual Contributor';
  const empty = {
    hostedSpaces: [],
    hostedVirtualContributors: [],
    hostedInnovationPacks: [],
    hostedInnovationHubs: [],
  };

  it('returns four empty buckets when input is null/undefined', () => {
    expect(mapOrgHostedResources(undefined, vcType)).toEqual(empty);
    expect(mapOrgHostedResources(null, vcType)).toEqual(empty);
  });

  it('returns four empty buckets when collections are missing', () => {
    expect(mapOrgHostedResources({}, vcType)).toEqual(empty);
  });

  it('drops spaces with no `about.profile` rather than crashing', () => {
    const resources: AccountResourcesShape = {
      spaces: [
        { id: 's-broken', about: { profile: null, isContentPublic: true } },
        { id: 's-ok', about: { profile: { displayName: 'OK', url: '/s/ok' }, isContentPublic: true } },
      ],
    };
    const result = mapOrgHostedResources(resources, vcType);
    expect(result.hostedSpaces).toHaveLength(1);
    expect(result.hostedSpaces[0].id).toBe('s-ok');
  });

  it('maps a space with banner + tagline to SpaceGridCardData', () => {
    const resources: AccountResourcesShape = {
      spaces: [
        {
          id: 's-1',
          about: {
            profile: {
              displayName: 'Org Space',
              url: '/s/org',
              tagline: 'Org tagline',
              cardBanner: { uri: 'https://cdn.example/banner.jpg' },
            },
            isContentPublic: true,
          },
        },
      ],
    };
    const result = mapOrgHostedResources(resources, vcType);
    expect(result.hostedSpaces[0]).toMatchObject({
      id: 's-1',
      title: 'Org Space',
      description: 'Org tagline',
      href: '/s/org',
      imageUrl: 'https://cdn.example/banner.jpg',
      isPrivate: false,
    });
    expect(typeof result.hostedSpaces[0].color).toBe('string');
  });

  it('treats only isContentPublic === false as private (undefined and true are public)', () => {
    const make = (isContentPublic: boolean | undefined): AccountResourcesShape => ({
      spaces: [
        {
          id: 's',
          about: { profile: { displayName: 'S', url: '/s' }, isContentPublic },
        },
      ],
    });
    expect(mapOrgHostedResources(make(false), vcType).hostedSpaces[0].isPrivate).toBe(true);
    expect(mapOrgHostedResources(make(true), vcType).hostedSpaces[0].isPrivate).toBe(false);
    expect(mapOrgHostedResources(make(undefined), vcType).hostedSpaces[0].isPrivate).toBe(false);
  });

  it('produces deterministic accent colours for the same id', () => {
    const make = (): AccountResourcesShape => ({
      spaces: [{ id: 'fixed-id', about: { profile: { displayName: 'X', url: '/x' }, isContentPublic: true } }],
    });
    const c1 = mapOrgHostedResources(make(), vcType).hostedSpaces[0].color;
    const c2 = mapOrgHostedResources(make(), vcType).hostedSpaces[0].color;
    expect(c1).toBe(c2);
  });

  it('maps virtual contributors with the provided vcType label', () => {
    const resources: AccountResourcesShape = {
      virtualContributors: [
        { id: 'vc-1', profile: { displayName: 'VC One', url: '/vc/1', tagline: 'first' } },
        { id: 'vc-2', profile: { displayName: 'VC Two', url: '/vc/2' } },
      ],
    };
    expect(mapOrgHostedResources(resources, vcType).hostedVirtualContributors).toEqual([
      { id: 'vc-1', displayName: 'VC One', description: 'first', type: 'Virtual Contributor', href: '/vc/1' },
      { id: 'vc-2', displayName: 'VC Two', description: null, type: 'Virtual Contributor', href: '/vc/2' },
    ]);
  });

  it('drops virtual contributors with missing `profile`', () => {
    const resources: AccountResourcesShape = {
      virtualContributors: [
        { id: 'vc-1', profile: null },
        { id: 'vc-2', profile: { displayName: 'OK', url: '/ok' } },
      ],
    };
    expect(mapOrgHostedResources(resources, vcType).hostedVirtualContributors).toHaveLength(1);
  });

  it('maps innovation packs and hubs into SimpleResourceCardItem shape (avatar fallback to null)', () => {
    const resources: AccountResourcesShape = {
      innovationPacks: [
        {
          id: 'p-1',
          profile: {
            displayName: 'Pack',
            url: '/p/1',
            tagline: 'pack desc',
            avatar: { uri: 'https://cdn.example/p.jpg' },
          },
        },
        { id: 'p-2', profile: { displayName: 'NoAvatar', url: '/p/2' } },
      ],
      innovationHubs: [{ id: 'h-1', profile: { displayName: 'Hub', url: '/h/1' } }],
    };
    const result = mapOrgHostedResources(resources, vcType);
    expect(result.hostedInnovationPacks).toEqual([
      {
        id: 'p-1',
        displayName: 'Pack',
        description: 'pack desc',
        href: '/p/1',
        avatarImageUrl: 'https://cdn.example/p.jpg',
      },
      { id: 'p-2', displayName: 'NoAvatar', description: null, href: '/p/2', avatarImageUrl: null },
    ]);
    expect(result.hostedInnovationHubs).toEqual([
      { id: 'h-1', displayName: 'Hub', description: null, href: '/h/1', avatarImageUrl: null },
    ]);
  });

  it('drops innovation packs/hubs with missing profile', () => {
    const resources: AccountResourcesShape = {
      innovationPacks: [
        { id: 'p-1', profile: null },
        { id: 'p-2', profile: { displayName: 'P', url: '/p' } },
      ],
      innovationHubs: [{ id: 'h-1', profile: null }],
    };
    const result = mapOrgHostedResources(resources, vcType);
    expect(result.hostedInnovationPacks).toHaveLength(1);
    expect(result.hostedInnovationHubs).toHaveLength(0);
  });
});
