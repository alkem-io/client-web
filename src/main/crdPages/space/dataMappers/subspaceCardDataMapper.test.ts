import { describe, expect, test } from 'vitest';
import { SpaceSortMode, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import { mapSubspacesToCardDataList } from './subspaceCardDataMapper';

const baseSubspace = {
  id: 'sub-1',
  visibility: SpaceVisibility.Active,
  about: {
    profile: {
      displayName: 'Alpha',
      tagline: 'TAG',
      description: 'WHAT',
      url: '/space/alpha',
      tagset: { tags: [] },
    },
    isContentPublic: true,
    why: 'WHY',
    who: 'WHO',
  },
  pinned: false,
};

describe('mapSubspacesToCardDataList — expanded-card excerpt fields (feature 076)', () => {
  test('description carries the tagline, what carries the About description — two distinct slots, never confused', () => {
    const [card] = mapSubspacesToCardDataList([baseSubspace], SpaceSortMode.Alphabetical);
    expect(card.description).toBe('TAG');
    expect(card.what).toBe('WHAT');
  });

  test('what, why and who all map through when present (the expanded query)', () => {
    const [card] = mapSubspacesToCardDataList([baseSubspace], SpaceSortMode.Alphabetical);
    expect(card.what).toBe('WHAT');
    expect(card.why).toBe('WHY');
    expect(card.who).toBe('WHO');
  });

  test('with compact-query data, what and who are undefined — but why still maps through harmlessly (research D6)', () => {
    const compactShaped = {
      ...baseSubspace,
      about: {
        profile: { displayName: 'Alpha', tagline: 'TAG', url: '/space/alpha', tagset: { tags: [] } },
        isContentPublic: true,
        why: 'WHY', // the shared SubspaceCard fragment has always selected this
      },
    };
    const [card] = mapSubspacesToCardDataList([compactShaped], SpaceSortMode.Alphabetical);
    expect(card.what).toBeUndefined();
    expect(card.who).toBeUndefined();
    expect(card.why).toBe('WHY');
  });

  test('existing fields (name, avatar, tags, leads, status) are unchanged by this addition', () => {
    const [card] = mapSubspacesToCardDataList([baseSubspace], SpaceSortMode.Alphabetical);
    expect(card.name).toBe('Alpha');
    expect(card.href).toBe('/space/alpha');
    expect(card.status).toBe('active');
    expect(card.leads).toEqual([]);
  });
});
