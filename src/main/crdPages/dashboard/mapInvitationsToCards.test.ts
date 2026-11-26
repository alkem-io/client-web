import { describe, expect, it } from 'vitest';
import { mapInvitationsToCards } from './dashboardDataMappers';
import { pendingSpaceRequest } from './dashboardPendingTestData';

describe('mapInvitationsToCards (Viewer.pendingInvitations)', () => {
  it('shows the card for an L0 space — it has no avatar, so the row used to be blank', () => {
    const [card] = mapInvitationsToCards([pendingSpaceRequest('inv', { card: 'card.png' })]);

    expect(card.spaceAvatarUrl).toBe('card.png');
  });

  it('keeps using the avatar for depth 1 and 2 subspaces', () => {
    const [l1] = mapInvitationsToCards([
      pendingSpaceRequest('l1', { depth: 1, avatar: 'avatar.png', card: 'card.png' }),
    ]);
    const [l2] = mapInvitationsToCards([
      pendingSpaceRequest('l2', { depth: 2, avatar: 'avatar.png', card: 'card.png' }),
    ]);

    expect(l1.spaceAvatarUrl).toBe('avatar.png');
    expect(l2.spaceAvatarUrl).toBe('avatar.png');
  });

  it('falls back to initials rather than borrowing the other visual', () => {
    const [l0] = mapInvitationsToCards([pendingSpaceRequest('l0', { avatar: 'avatar.png' })]);

    expect(l0.spaceAvatarUrl).toBeUndefined();
  });

  it('carries the inviter name, space id, href and a deterministic colour through', () => {
    const [card] = mapInvitationsToCards([pendingSpaceRequest('inv')]);

    expect(card).toMatchObject({ id: 'inv', spaceId: 'space-inv', inviterName: 'Jane Doe', spaceHref: '/a-space' });
    expect(card.color).toMatch(/^#/);
  });

  it('omits the inviter name when the invitation has no createdBy', () => {
    const [card] = mapInvitationsToCards([pendingSpaceRequest('inv', {}, { createdBy: null })]);

    expect(card.inviterName).toBeUndefined();
  });

  it('a request without a space or a space route is an error, not an empty card', () => {
    expect(() => mapInvitationsToCards([pendingSpaceRequest('inv', {}, { space: null })])).toThrow('names no space');
    expect(() => mapInvitationsToCards([pendingSpaceRequest('inv', { url: null })])).toThrow(
      'has no canonical destination'
    );
  });
});
