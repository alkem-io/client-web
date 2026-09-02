import { describe, expect, test, vi } from 'vitest';
import type { InnovationHubHomeInnovationHubFragment } from '@/core/apollo/generated/graphql-schema';
import { AuthorizationPrivilege, InnovationHubType, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import { mapInnovationHubSpaces, mapInnovationHubToHomeData } from '../dataMappers/mapInnovationHubToHomeData';

vi.mock('@/main/crdPages/spaces/spaceCardDataMapper', () => ({
  // identity-like mapper for the tests — we assert on order + intersection, not card
  // shape. Undefined-safe, like the real mapper (returns [] when given no spaces).
  mapSpacesToCardDataList: (spaces: { id: string }[] | undefined) =>
    (spaces ?? []).map(s => ({ id: s.id, name: `space-${s.id}` })),
}));

const baseHub: InnovationHubHomeInnovationHubFragment = {
  id: 'hub-1',
  // Intentional mismatch: `nameID` and `subdomain` can diverge for hubs whose
  // display name doesn't match the chosen subdomain. Path-based hub URLs MUST
  // use `nameID` (the route param the server resolves) — assertions below pin
  // this and reject any reversion to `subdomain` for paths.
  nameID: 'demo-name-id',
  subdomain: 'demo',
  // Default fixture is a `list` hub; visibility-hub tests override `type`.
  type: InnovationHubType.List,
  spaceVisibilityFilter: undefined,
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

describe('mapInnovationHubToHomeData (header)', () => {
  test('renders banner image when present', () => {
    const data = mapInnovationHubToHomeData({ hub: baseHub, canonicalDomain: 'alkemio.org' });
    expect(data.bannerImageUrl).toBe('https://example.com/banner.png');
    expect(data.bannerAlt).toBe('banner alt');
  });

  test('falls back to undefined banner when not set', () => {
    const data = mapInnovationHubToHomeData({
      hub: { ...baseHub, profile: { ...baseHub.profile, banner: undefined } },
      canonicalDomain: 'alkemio.org',
    });
    expect(data.bannerImageUrl).toBeUndefined();
    expect(data.bannerColor).toMatch(/^#/);
  });

  test('admin with Update privilege gets settingsUrl built from nameID (NOT subdomain)', () => {
    const data = mapInnovationHubToHomeData({
      hub: { ...baseHub, authorization: { myPrivileges: [AuthorizationPrivilege.Update] } },
      canonicalDomain: 'alkemio.org',
    });
    // baseHub has nameID 'demo-name-id' and subdomain 'demo' — the route is
    // `/hub/:innovationHubNameId`, so the URL must use nameID, not subdomain.
    expect(data.settingsUrl).toBe('/hub/demo-name-id/settings');
    expect(data.settingsUrl).not.toBe('/hub/demo/settings');
  });

  test('non-admin gets no settingsUrl', () => {
    const data = mapInnovationHubToHomeData({ hub: baseHub, canonicalDomain: 'alkemio.org' });
    expect(data.settingsUrl).toBeUndefined();
  });

  test('allSpacesUrl composes a canonical absolute URL from a bare-host config', () => {
    const data = mapInnovationHubToHomeData({ hub: baseHub, canonicalDomain: 'alkemio.org' });
    // jsdom defaults to `http:`; in production the page protocol is `https:`.
    // `buildMainDomainUrl` inherits the page protocol for bare-host configs.
    expect(data.allSpacesUrl).toMatch(/^https?:\/\/alkemio\.org\/spaces$/);
  });

  test('allSpacesUrl uses a full-URL config verbatim (dev shape)', () => {
    const data = mapInnovationHubToHomeData({ hub: baseHub, canonicalDomain: 'http://localhost:3000' });
    expect(data.allSpacesUrl).toBe('http://localhost:3000/spaces');
  });

  test('allSpacesUrl falls back to the path when no canonical domain is configured', () => {
    const data = mapInnovationHubToHomeData({ hub: baseHub, canonicalDomain: '' });
    expect(data.allSpacesUrl).toBe('/spaces');
  });
});

describe('mapInnovationHubSpaces', () => {
  test('list hub: shows only the curated spaceListFilter, in filter order — never the full platform list', () => {
    const spaces = mapInnovationHubSpaces(
      {
        ...baseHub,
        // 's-2' precedes 's-1'; 's-missing' is curated but absent from the platform
        // results (deleted/inaccessible) and is dropped. 's-3' is a platform Space
        // NOT in the hub — it must NOT leak onto the hub home.
        spaceListFilter: [{ id: 's-2' }, { id: 's-1' }, { id: 's-missing' }],
      },
      // dashboardSpaces shape is structurally compatible with SpaceWithParent for the mapper test
      dashboardSpaces as never,
      false
    );
    expect(spaces.map(s => s.id)).toEqual(['s-2', 's-1']);
  });

  test('list hub: keeps a curated space regardless of its visibility (present in the all-visibilities results)', () => {
    const spaces = mapInnovationHubSpaces(
      { ...baseHub, spaceListFilter: [{ id: 's-1' }, { id: 's-2' }, { id: 's-3' }] },
      dashboardSpaces as never,
      false
    );
    expect(spaces.map(s => s.id)).toEqual(['s-1', 's-2', 's-3']);
  });

  test('list hub with empty spaceListFilter shows nothing — never the full platform list', () => {
    const spaces = mapInnovationHubSpaces(baseHub, dashboardSpaces as never, false);
    expect(spaces).toEqual([]);
  });

  test('visibility hub: shows all the visibility-filtered spaces the caller fetched', () => {
    const spaces = mapInnovationHubSpaces(
      // A visibility hub has no curated list; the caller fetched Spaces matching
      // `spaceVisibilityFilter`, so those results are the hub's Spaces — shown as-is.
      { ...baseHub, type: InnovationHubType.Visibility, spaceVisibilityFilter: SpaceVisibility.Demo },
      dashboardSpaces as never,
      false
    );
    expect(spaces.map(s => s.id)).toEqual(['s-3', 's-1', 's-2']);
  });

  test('visibility hub with no fetched spaces yields an empty array', () => {
    const spaces = mapInnovationHubSpaces(
      { ...baseHub, type: InnovationHubType.Visibility, spaceVisibilityFilter: SpaceVisibility.Demo },
      undefined,
      false
    );
    expect(spaces).toEqual([]);
  });
});
