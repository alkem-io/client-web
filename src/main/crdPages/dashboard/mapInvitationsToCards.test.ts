import { describe, expect, it } from 'vitest';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { mapInvitationsToCards } from './dashboardDataMappers';

const entry = (
  level: SpaceLevel,
  profile: { avatar?: { uri: string }; cardBanner?: { uri: string } }
): Parameters<typeof mapInvitationsToCards>[0][number] => ({
  id: `inv-${level}`,
  spacePendingMembershipInfo: {
    id: `space-${level}`,
    level,
    about: { profile: { displayName: 'A Space', url: '/a-space', ...profile } },
  },
  contributorType: 'USER',
});

describe('mapInvitationsToCards', () => {
  it('shows the cardBanner for an L0 space — it has no avatar, so the row used to be blank', () => {
    const [card] = mapInvitationsToCards([entry(SpaceLevel.L0, { cardBanner: { uri: 'card.png' } })]);

    expect(card.spaceAvatarUrl).toBe('card.png');
  });

  it('keeps using the avatar for L1 and L2 subspaces', () => {
    const [l1] = mapInvitationsToCards([
      entry(SpaceLevel.L1, { avatar: { uri: 'avatar.png' }, cardBanner: { uri: 'card.png' } }),
    ]);
    const [l2] = mapInvitationsToCards([
      entry(SpaceLevel.L2, { avatar: { uri: 'avatar.png' }, cardBanner: { uri: 'card.png' } }),
    ]);

    expect(l1.spaceAvatarUrl).toBe('avatar.png');
    expect(l2.spaceAvatarUrl).toBe('avatar.png');
  });

  it('falls back to initials rather than borrowing the other visual', () => {
    const [l0] = mapInvitationsToCards([entry(SpaceLevel.L0, { avatar: { uri: 'avatar.png' } })]);

    expect(l0.spaceAvatarUrl).toBeUndefined();
  });

  it('carries role, href and a deterministic colour through', () => {
    const [card] = mapInvitationsToCards([entry(SpaceLevel.L0, {})]);

    expect(card.role).toBe('USER');
    expect(card.spaceHref).toBe('/a-space');
    expect(card.color).toMatch(/^#/);
  });
});
