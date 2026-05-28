import { describe, expect, test, vi } from 'vitest';
import type { InnovationHubHomeInnovationHubFragment } from '@/core/apollo/generated/graphql-schema';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { mapInnovationHubToHomeData } from '../dataMappers/mapInnovationHubToHomeData';

vi.mock('@/main/crdPages/spaces/spaceCardDataMapper', () => ({
  // identity-like mapper for the tests — we assert on order + intersection, not card shape
  mapSpacesToCardDataList: (spaces: { id: string }[]) => spaces.map(s => ({ id: s.id, name: `space-${s.id}` })),
}));

const baseHub: InnovationHubHomeInnovationHubFragment = {
  id: 'hub-1',
  nameID: 'demo',
  subdomain: 'demo',
  profile: {
    id: 'profile-1',
    displayName: 'Demo Hub',
    tagline: 'innovation everywhere',
    description: 'long description',
    banner: { id: 'banner-1', uri: 'https://example.com/banner.png', alternativeText: 'banner alt' },
  },
  spaceListFilter: [],
  authorization: { myPrivileges: [] },
};

const dashboardSpaces = [
  { id: 's-3', extra: 'three' },
  { id: 's-1', extra: 'one' },
  { id: 's-2', extra: 'two' },
];

describe('mapInnovationHubToHomeData', () => {
  test('renders banner image when present', () => {
    const data = mapInnovationHubToHomeData({
      hub: baseHub,
      dashboardSpaces: undefined,
      authenticated: false,
      canonicalDomain: 'alkemio.org',
    });
    expect(data.bannerImageUrl).toBe('https://example.com/banner.png');
    expect(data.bannerAlt).toBe('banner alt');
  });

  test('falls back to undefined banner when not set', () => {
    const data = mapInnovationHubToHomeData({
      hub: { ...baseHub, profile: { ...baseHub.profile, banner: undefined } },
      dashboardSpaces: undefined,
      authenticated: false,
      canonicalDomain: 'alkemio.org',
    });
    expect(data.bannerImageUrl).toBeUndefined();
    expect(data.bannerColor).toMatch(/^#/);
  });

  test('admin with Update privilege gets settingsUrl', () => {
    const data = mapInnovationHubToHomeData({
      hub: { ...baseHub, authorization: { myPrivileges: [AuthorizationPrivilege.Update] } },
      dashboardSpaces: undefined,
      authenticated: true,
      canonicalDomain: 'alkemio.org',
    });
    expect(data.settingsUrl).toBe('/hub/demo/settings');
  });

  test('non-admin gets no settingsUrl', () => {
    const data = mapInnovationHubToHomeData({
      hub: baseHub,
      dashboardSpaces: undefined,
      authenticated: false,
      canonicalDomain: 'alkemio.org',
    });
    expect(data.settingsUrl).toBeUndefined();
  });

  test('spaces are intersected with dashboardSpaces and reordered by filter order', () => {
    const data = mapInnovationHubToHomeData({
      hub: {
        ...baseHub,
        spaceListFilter: [{ id: 's-2' }, { id: 's-1' }, { id: 's-missing' }],
      },
      // dashboardSpaces shape is structurally compatible with SpaceWithParent for the mapper test
      dashboardSpaces: dashboardSpaces as never,
      authenticated: false,
      canonicalDomain: 'alkemio.org',
    });
    expect(data.spaces.map(s => s.id)).toEqual(['s-2', 's-1']);
  });

  test('empty spaceListFilter yields empty spaces array', () => {
    const data = mapInnovationHubToHomeData({
      hub: baseHub,
      dashboardSpaces: dashboardSpaces as never,
      authenticated: false,
      canonicalDomain: 'alkemio.org',
    });
    expect(data.spaces).toEqual([]);
  });

  test('allSpacesUrl composes a canonical absolute URL from a bare-host config', () => {
    const data = mapInnovationHubToHomeData({
      hub: baseHub,
      dashboardSpaces: undefined,
      authenticated: false,
      canonicalDomain: 'alkemio.org',
    });
    // jsdom defaults to `http:`; in production the page protocol is `https:`.
    // `buildMainDomainUrl` inherits the page protocol for bare-host configs.
    expect(data.allSpacesUrl).toMatch(/^https?:\/\/alkemio\.org\/spaces$/);
  });

  test('allSpacesUrl uses a full-URL config verbatim (dev shape)', () => {
    const data = mapInnovationHubToHomeData({
      hub: baseHub,
      dashboardSpaces: undefined,
      authenticated: false,
      canonicalDomain: 'http://localhost:3000',
    });
    expect(data.allSpacesUrl).toBe('http://localhost:3000/spaces');
  });

  test('allSpacesUrl falls back to the path when no canonical domain is configured', () => {
    const data = mapInnovationHubToHomeData({
      hub: baseHub,
      dashboardSpaces: undefined,
      authenticated: false,
      canonicalDomain: '',
    });
    expect(data.allSpacesUrl).toBe('/spaces');
  });
});
