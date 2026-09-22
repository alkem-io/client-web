import { describe, expect, test } from 'vitest';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import { mapContributorItemToCard } from './contributorCollectionDataMapper';

type MapperInput = Parameters<typeof mapContributorItemToCard>[0];

// The generated query type models an absent field as `T | undefined`
// (`preResolveTypes` / `maybeValue` codegen config), but a real network
// response sends explicit `null` for an unselected nullable field. This
// fixture type matches the wire shape so the "nulls become undefined" cases
// below reflect what the mapper actually receives; the call site casts to the
// generated type at the boundary.
type RawLocation = {
  city?: string | null;
  country?: string | null;
  latitude?: number;
  longitude?: number;
  hasValidCoordinates: boolean;
};

type RawItem = Omit<
  MapperInput,
  'roleLabel' | 'avatarUrl' | 'url' | 'tagline' | 'tags' | 'website' | 'associatesCount' | 'joinedDate' | 'location'
> & {
  roleLabel?: string | null;
  avatarUrl?: string | null;
  url?: string | null;
  tagline?: string | null;
  tags?: string[] | null;
  website?: string | null;
  associatesCount?: number | null;
  joinedDate?: Date | null;
  location?: RawLocation | null;
};

const map = (item: RawItem) => mapContributorItemToCard(item as MapperInput);

const baseItem: RawItem = {
  id: 'user-ada',
  type: ActorType.User,
  displayName: 'Ada',
  avatarUrl: 'https://alkemio.test/avatar.png',
  roleLabel: 'lead',
  url: 'https://alkemio.test/ada',
  location: {
    city: 'Barcelona',
    country: 'ES',
    latitude: 41.38,
    longitude: 2.17,
    hasValidCoordinates: true,
  },
  tagline: '  Building things that matter  ',
  tags: ['Urban Planning', 'Sustainability', 'Facilitation'],
  joinedDate: new Date('2023-10-01T00:00:00.000Z'),
  website: null,
  associatesCount: null,
};

describe('mapContributorItemToCard', () => {
  test('maps every field of a fully populated item', () => {
    const card = map(baseItem);

    expect(card).toEqual({
      id: 'user-ada',
      type: 'user',
      name: 'Ada',
      avatarUrl: 'https://alkemio.test/avatar.png',
      roleLabel: 'lead',
      href: 'https://alkemio.test/ada',
      locationLabel: 'Barcelona, ES',
      latitude: 41.38,
      longitude: 2.17,
      hasValidCoordinates: true,
      tagline: '  Building things that matter  ',
      tags: ['Urban Planning', 'Sustainability', 'Facilitation'],
      associatesCount: undefined,
      websiteUrl: undefined,
      joinedDate: '2023-10-01T00:00:00.000Z',
    });
  });

  test('nulls become undefined / empty list — never the literal null', () => {
    const card = map({
      ...baseItem,
      tagline: null,
      tags: null,
      website: null,
      associatesCount: null,
      joinedDate: null,
    });

    expect(card.tagline).toBeUndefined();
    expect(card.tags).toEqual([]);
    expect(card.websiteUrl).toBeUndefined();
    expect(card.associatesCount).toBeUndefined();
    expect(card.joinedDate).toBeUndefined();
  });

  test('associatesCount: 0 survives — never coalesced to undefined', () => {
    const card = map({
      ...baseItem,
      type: ActorType.Organization,
      associatesCount: 0,
    });

    expect(card.associatesCount).toBe(0);
  });

  test('an organization item maps website and associatesCount', () => {
    const card = map({
      ...baseItem,
      id: 'org-green-future',
      type: ActorType.Organization,
      website: 'https://greenfuture.example',
      associatesCount: 3,
    });

    expect(card.type).toBe('organization');
    expect(card.websiteUrl).toBe('https://greenfuture.example');
    expect(card.associatesCount).toBe(3);
  });

  test('existing location/role mapping is unchanged: city-only, country-only, and no-location cases', () => {
    const location = baseItem.location as RawLocation;
    expect(map({ ...baseItem, location: { ...location, country: null } })).toMatchObject({
      locationLabel: 'Barcelona',
    });
    expect(map({ ...baseItem, location: { ...location, city: null } })).toMatchObject({
      locationLabel: 'ES',
    });
    expect(map({ ...baseItem, location: null })).toMatchObject({
      locationLabel: undefined,
      hasValidCoordinates: false,
      latitude: undefined,
      longitude: undefined,
    });
  });

  test('existing role normalisation is unchanged: any non-lead label reads as member', () => {
    expect(map({ ...baseItem, roleLabel: 'admin' }).roleLabel).toBe('member');
    expect(map({ ...baseItem, roleLabel: null }).roleLabel).toBeUndefined();
  });
});
