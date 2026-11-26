import { describe, expect, test } from 'vitest';
import type { NativeSubspaceCardFragment } from '@/core/apollo/generated-v2/graphql-schema';
import { mapSortMode, mapSortModeToBackend, mapSubspaceToTile } from './subspacesMapper';

describe('mapSortMode / mapSortModeToBackend', () => {
  test('round-trips custom ↔ manual', () => {
    expect(mapSortMode({ sort_mode: 'custom' })).toBe('manual');
    expect(mapSortModeToBackend('manual')).toBe('custom');
    expect(mapSortModeToBackend(mapSortMode({ sort_mode: 'custom' }))).toBe('custom');
  });

  test('round-trips alphabetical ↔ alphabetical', () => {
    expect(mapSortMode({ sort_mode: 'alphabetical' })).toBe('alphabetical');
    expect(mapSortModeToBackend('alphabetical')).toBe('alphabetical');
    expect(mapSortModeToBackend(mapSortMode({ sort_mode: 'alphabetical' }))).toBe('alphabetical');
  });

  test('an absent sort_mode is the declared default, alphabetical', () => {
    expect(mapSortMode({})).toBe('alphabetical');
    expect(mapSortMode(null)).toBe('alphabetical');
  });
});

describe('mapSubspaceToTile', () => {
  test('maps the NativeSubspaceCard face onto the tile', () => {
    const card: NativeSubspaceCardFragment = {
      __typename: 'Space',
      id: 'child-1',
      url: '/space/child',
      status: 'ACTIVE',
      isContentPublic: true,
      pinned: true,
      tags: [],
      about: {
        __typename: 'About',
        displayName: 'Child space',
        tagline: 'Tagline',
        avatar: { __typename: 'FileRef', file: { __typename: 'File', url: '/avatar' } },
        card: { __typename: 'FileRef', file: { __typename: 'File', url: '/card' } },
      },
      membership: null,
      can: { __typename: 'SpaceCan', read: true },
      leads: [],
    };
    expect(mapSubspaceToTile(card)).toMatchObject({
      id: 'child-1',
      name: 'Child space',
      description: 'Tagline',
      href: '/space/child',
      avatarUrl: '/avatar',
      bannerUrl: '/card',
      initials: 'CH',
      visibility: 'active',
      isPinned: true,
    });
  });
});
