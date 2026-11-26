import { describe, expect, test } from 'vitest';
import { SpaceKind } from '@/core/apollo/generated-v2/graphql-schema';
import {
  homepageSpaceSelection,
  mapHomepageHeader,
  mapHomepagePacks,
  mapHomepageVirtualContributors,
  type NativeHomepage,
  orderHomepageSpaces,
} from './homepageV2DataMapper';

const hub: NativeHomepage = {
  id: 'hub',
  kind: SpaceKind.Homepage,
  url: '/hub/example',
  can: { update: true },
  about: {
    displayName: 'Example',
    banner: { alt: 'Original banner description', file: { id: 'banner', url: '/banner' } },
  },
};

describe('legacy homepage space selection', () => {
  test.each([
    { hub: { type: 'unknown' } },
    { hub: { type: 'list', space_ids: [1] } },
    { hub: { type: 'visibility', status_filter: ['DRAFT'] } },
  ])('rejects malformed selection settings without coercion: %j', settings => {
    expect(() => homepageSpaceSelection(settings)).toThrow();
  });

  test('a metadata-only homepage has no settings destination even when update is allowed', () => {
    const data = mapHomepageHeader({ ...hub, url: null }, 'https://platform.test');
    expect(data.name).toBe('Example');
    expect(data.settingsUrl).toBeUndefined();
  });

  test('curated packs and contributors remain visible when their canonical URLs are absent', () => {
    const metadata: NativeHomepage = {
      ...hub,
      curated: [
        {
          role: 'pack',
          sortOrder: 0,
          node: {
            id: 'pack',
            entityType: 'space',
            kind: SpaceKind.Pack,
            url: null,
            tags: [],
            templateCount: 2,
            about: { displayName: 'Pack metadata' },
          },
        },
        {
          role: 'agent',
          sortOrder: 1,
          node: {
            id: 'agent',
            entityType: 'agent',
            actorType: 'agent',
            url: null,
            about: { displayName: 'Agent metadata' },
          },
        },
      ],
    };
    expect(mapHomepagePacks(metadata)).toEqual([
      expect.objectContaining({ id: 'pack', name: 'Pack metadata', url: undefined }),
    ]);
    expect(mapHomepageVirtualContributors(metadata, 'VC')).toEqual([
      expect.objectContaining({ id: 'agent', displayName: 'Agent metadata', href: undefined }),
    ]);
  });
  // fed85 mapInnovationHubToHomeData.ts:34–61: real alt text and edit privilege, not a guessed privilege list.
  test('maps the existing header props and withholds settings for a non-editor', () => {
    expect(mapHomepageHeader(hub, 'https://platform.test')).toMatchObject({
      name: 'Example',
      bannerImageUrl: '/banner',
      bannerAlt: 'Original banner description',
      settingsUrl: '/hub/example/settings',
      allSpacesUrl: 'https://platform.test/spaces',
    });
    expect(mapHomepageHeader({ ...hub, can: { update: false } }, 'https://platform.test').settingsUrl).toBeUndefined();
  });

  // fed85 mapInnovationHubToHomeData.ts:126–147: packs and contributors retain their real destinations.
  test('maps curated packs and contributors without replacing URLs or missing provider links', () => {
    const curatedHub: NativeHomepage = {
      ...hub,
      curated: [
        {
          role: 'pack',
          sortOrder: 0,
          node: {
            id: 'pack',
            entityType: 'space',
            kind: SpaceKind.Pack,
            url: '/pack',
            tags: ['tag'],
            templateCount: 4,
            about: { displayName: 'Pack', description: 'Description' },
            host: { about: { displayName: 'Provider' }, url: null },
          },
        },
        {
          role: 'agent',
          sortOrder: 1,
          node: {
            id: 'agent',
            entityType: 'agent',
            actorType: 'agent',
            url: '/vc/agent',
            about: { displayName: 'Contributor', tagline: 'Tagline' },
          },
        },
      ],
    };
    expect(mapHomepagePacks(curatedHub)).toEqual([
      expect.objectContaining({
        id: 'pack',
        templateCount: 4,
        url: '/pack',
        providerName: 'Provider',
        providerUrl: undefined,
      }),
    ]);
    expect(mapHomepageVirtualContributors(curatedHub, 'VC')).toEqual([
      {
        id: 'agent',
        displayName: 'Contributor',
        description: 'Tagline',
        type: 'VC',
        href: '/vc/agent',
        avatarImageUrl: null,
      },
    ]);
  });
  // fed85 useInnovationHubHomeData.ts:55–76 and model99064d76: listing policy is not a space status.
  test('visibility mode passes declared statuses independently of the homepage listing policy', () => {
    for (const visibility of ['public', 'account', 'hidden']) {
      expect(
        homepageSpaceSelection({ hub: { type: 'visibility', visibility, status_filter: ['DEMO', 'ARCHIVED'] } })
      ).toEqual({
        filter: { status: ['DEMO', 'ARCHIVED'] },
        skip: false,
      });
    }
  });

  // fed85 useInnovationHubHomeData.ts:63–66: an absent status filter includes all four statuses.
  test('an absent status filter preserves all legacy statuses', () => {
    expect(homepageSpaceSelection({ hub: { type: 'visibility' } }).filter.status).toEqual([
      'ACTIVE',
      'DEMO',
      'INACTIVE',
      'ARCHIVED',
    ]);
  });

  // fed85 mapInnovationHubToHomeData.ts:91–115: list mode intersects in configured order, not status order.
  test('list mode keeps curated order and does not apply the visibility-mode status filter', () => {
    const selection = homepageSpaceSelection({
      hub: { type: 'list', space_ids: ['b', 'missing', 'a'], status_filter: ['ACTIVE'] },
    });
    expect(selection.filter).toEqual({ ids: ['b', 'missing', 'a'] });
    expect(orderHomepageSpaces(selection, [{ id: 'a' }, { id: 'b' }, { id: 'unlisted' }])).toEqual([
      { id: 'b' },
      { id: 'a' },
    ]);
  });

  test('empty selections never become an unfiltered platform query', () => {
    expect(homepageSpaceSelection({ hub: { type: 'list', space_ids: [] } }).skip).toBe(true);
    expect(homepageSpaceSelection({ hub: { type: 'visibility', status_filter: [] } }).skip).toBe(true);
    expect(orderHomepageSpaces(homepageSpaceSelection(null), [{ id: 'unrelated' }])).toEqual([]);
  });
});
