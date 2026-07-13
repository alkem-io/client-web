import { describe, expect, it } from 'vitest';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { mapApplicationsToCards } from './dashboardDataMappers';

const entry = (
  level: SpaceLevel,
  profile: { avatar?: { uri: string }; cardBanner?: { uri: string } }
): Parameters<typeof mapApplicationsToCards>[0][number] => ({
  id: `app-${level}`,
  spacePendingMembershipInfo: {
    id: `space-${level}`,
    level,
    about: { profile: { displayName: 'A Space', url: '/a-space', ...profile } },
  },
});

describe('mapApplicationsToCards', () => {
  it('uses the cardBanner for an L0 space, which has no avatar', () => {
    const [card] = mapApplicationsToCards([
      entry(SpaceLevel.L0, { cardBanner: { uri: 'card.png' }, avatar: { uri: 'avatar.png' } }),
    ]);

    expect(card.spaceImageUrl).toBe('card.png');
  });

  it('uses the avatar for L1 and L2 subspaces', () => {
    const [l1] = mapApplicationsToCards([
      entry(SpaceLevel.L1, { cardBanner: { uri: 'card.png' }, avatar: { uri: 'avatar.png' } }),
    ]);
    const [l2] = mapApplicationsToCards([
      entry(SpaceLevel.L2, { cardBanner: { uri: 'card.png' }, avatar: { uri: 'avatar.png' } }),
    ]);

    expect(l1.spaceImageUrl).toBe('avatar.png');
    expect(l2.spaceImageUrl).toBe('avatar.png');
  });

  it('treats the backend\'s empty-string uri as "no image"', () => {
    // The server returns a Visual object with `uri: ""` when nothing is uploaded,
    // so a truthiness check — not a null check — is what decides the fallback.
    const [l0] = mapApplicationsToCards([entry(SpaceLevel.L0, { cardBanner: { uri: '' } })]);
    const [l1] = mapApplicationsToCards([entry(SpaceLevel.L1, { avatar: { uri: '' } })]);

    expect(l0.spaceImageUrl).toBeUndefined();
    expect(l1.spaceImageUrl).toBeUndefined();
  });

  it('never substitutes one visual for the other when the right one is absent', () => {
    const l0 = mapApplicationsToCards([entry(SpaceLevel.L0, { avatar: { uri: 'avatar.png' } })])[0];
    const l1 = mapApplicationsToCards([entry(SpaceLevel.L1, { cardBanner: { uri: 'card.png' } })])[0];

    expect(l0.spaceImageUrl).toBeUndefined();
    expect(l1.spaceImageUrl).toBeUndefined();
  });

  it('carries name, href and a deterministic colour through', () => {
    const [card] = mapApplicationsToCards([entry(SpaceLevel.L0, {})]);

    expect(card.spaceName).toBe('A Space');
    expect(card.spaceHref).toBe('/a-space');
    expect(card.color).toMatch(/^#/);
  });
});
