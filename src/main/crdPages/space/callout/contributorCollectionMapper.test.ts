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
    });
    expect(healed.defaultType).toBe('user');
  });

  test('heals defaultView to list when the selection becomes VC-only (FR-006c)', () => {
    const healed = healContributorCollection({
      types: ['virtualContributor'],
      defaultType: 'virtualContributor',
      defaultView: 'map',
    });
    expect(healed.defaultView).toBe('list');
  });

  test('keeps a valid map default when a locatable type remains', () => {
    const healed = healContributorCollection({
      types: ['organization', 'virtualContributor'],
      defaultType: 'organization',
      defaultView: 'map',
    });
    expect(healed.defaultView).toBe('map');
  });

  test('maps the form config to the server input (healed)', () => {
    const input = contributorCollectionToServer({
      types: ['user', 'organization'],
      defaultType: 'organization',
      defaultView: 'map',
    });
    expect(input).toEqual({
      contributorTypes: [ActorType.User, ActorType.Organization],
      defaultContributorType: ActorType.Organization,
      defaultView: ContributorCollectionView.Map,
    });
  });

  test('defaults to all three types when server settings are absent', () => {
    const config = contributorCollectionFromServer(undefined);
    expect(config.types).toEqual(['user', 'organization', 'virtualContributor']);
    expect(config.defaultType).toBe('user');
    expect(config.defaultView).toBe('list');
  });

  test('round-trips server settings back into the form config', () => {
    const config = contributorCollectionFromServer({
      contributorTypes: [ActorType.Organization, ActorType.User],
      defaultContributorType: ActorType.Organization,
      defaultView: ContributorCollectionView.Map,
    });
    expect(config).toEqual({
      types: ['organization', 'user'],
      defaultType: 'organization',
      defaultView: 'map',
    });
  });
});
