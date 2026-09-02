import { describe, expect, test } from 'vitest';
import { ActorType, ContributorCollectionView } from '@/core/apollo/generated/graphql-schema';
import {
  contributorCollectionFromServer,
  contributorCollectionToServer,
  healContributorCollection,
} from './contributorCollectionMapper';

describe('contributorCollectionMapper', () => {
  test('heals defaultType to the first selected when it is deselected (FR-006b)', () => {
    const healed = healContributorCollection({
      types: ['user', 'virtualContributor'],
      defaultType: 'organization', // not selected
      defaultView: 'list',
      mapView: null,
    });
    expect(healed.defaultType).toBe('user');
  });

  test('heals defaultView to list when the selection becomes VC-only (FR-006c)', () => {
    const healed = healContributorCollection({
      types: ['virtualContributor'],
      defaultType: 'virtualContributor',
      defaultView: 'map',
      mapView: null,
    });
    expect(healed.defaultView).toBe('list');
  });

  test('keeps a valid map default when a locatable type remains', () => {
    const healed = healContributorCollection({
      types: ['organization', 'virtualContributor'],
      defaultType: 'organization',
      defaultView: 'map',
      mapView: null,
    });
    expect(healed.defaultView).toBe('map');
  });

  test('maps the form config to the server input (healed)', () => {
    const input = contributorCollectionToServer({
      types: ['user', 'organization'],
      defaultType: 'organization',
      defaultView: 'map',
      mapView: null,
    });
    expect(input).toEqual({
      contributorTypes: [ActorType.User, ActorType.Organization],
      defaultContributorType: ActorType.Organization,
      defaultView: ContributorCollectionView.Map,
      mapView: null,
    });
  });

  test('defaults to all three types when server settings are absent', () => {
    const config = contributorCollectionFromServer(undefined);
    expect(config.types).toEqual(['user', 'organization', 'virtualContributor']);
    expect(config.defaultType).toBe('user');
    expect(config.defaultView).toBe('list');
    expect(config.mapView).toBeNull();
  });

  test('round-trips server settings back into the form config', () => {
    const config = contributorCollectionFromServer({
      contributorTypes: [ActorType.Organization, ActorType.User],
      defaultContributorType: ActorType.Organization,
      defaultView: ContributorCollectionView.Map,
      // biome-ignore lint/suspicious/noExplicitAny: codegen uses T|undefined but server may send null
      mapView: null as any,
    });
    expect(config).toEqual({
      types: ['organization', 'user'],
      defaultType: 'organization',
      defaultView: 'map',
      mapView: null,
    });
  });

  // mapView tests

  test('heal does NOT touch mapView (isolation from type-healing)', () => {
    const view = { longitude: 4.9, latitude: 52.37, zoom: 10 };
    const healed = healContributorCollection({
      types: ['virtualContributor'],
      defaultType: 'virtualContributor',
      defaultView: 'map', // should heal to list
      mapView: view,
    });
    // defaultView heals to list but mapView is untouched
    expect(healed.defaultView).toBe('list');
    expect(healed.mapView).toEqual(view);
  });

  test('contributorCollectionToServer includes valid mapView', () => {
    const view = { longitude: 4.9, latitude: 52.37, zoom: 10 };
    const input = contributorCollectionToServer({
      types: ['user'],
      defaultType: 'user',
      defaultView: 'list',
      mapView: view,
    });
    expect(input.mapView).toEqual({ longitude: 4.9, latitude: 52.37, zoom: 10 });
  });

  test('contributorCollectionToServer emits explicit null for reset (clear semantics)', () => {
    const input = contributorCollectionToServer({
      types: ['user'],
      defaultType: 'user',
      defaultView: 'list',
      mapView: null,
    });
    expect(input.mapView).toBeNull();
  });

  test('contributorCollectionFromServer reads a valid server mapView', () => {
    const config = contributorCollectionFromServer({
      contributorTypes: [ActorType.User],
      defaultContributorType: ActorType.User,
      defaultView: ContributorCollectionView.List,
      mapView: { longitude: 4.9, latitude: 52.37, zoom: 10 },
    });
    expect(config.mapView).toEqual({ longitude: 4.9, latitude: 52.37, zoom: 10 });
  });

  test('read-guard: invalid server mapView (lat 91) → null (automatic framing)', () => {
    const config = contributorCollectionFromServer({
      contributorTypes: [ActorType.User],
      defaultContributorType: ActorType.User,
      defaultView: ContributorCollectionView.List,
      mapView: { longitude: 0, latitude: 91, zoom: 5 }, // lat out of range
    });
    expect(config.mapView).toBeNull();
  });

  test('read-guard: absent server mapView → null', () => {
    const config = contributorCollectionFromServer({
      contributorTypes: [ActorType.User],
      defaultContributorType: ActorType.User,
      defaultView: ContributorCollectionView.List,
      mapView: undefined,
    });
    expect(config.mapView).toBeNull();
  });

  test('read-guard: null server mapView → null', () => {
    const config = contributorCollectionFromServer({
      contributorTypes: [ActorType.User],
      defaultContributorType: ActorType.User,
      defaultView: ContributorCollectionView.List,
      // biome-ignore lint/suspicious/noExplicitAny: codegen uses T|undefined but server may send null
      mapView: null as any,
    });
    expect(config.mapView).toBeNull();
  });
});
