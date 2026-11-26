import { describe, expect, it } from 'vitest';
import { mapApplicationsToCards } from './dashboardDataMappers';
import { pendingSpaceRequest } from './dashboardPendingTestData';

describe('mapApplicationsToCards (Viewer.pendingApplications)', () => {
  it('uses the card for an L0 space, which has no avatar', () => {
    const [card] = mapApplicationsToCards([pendingSpaceRequest('app', { card: 'card.png', avatar: 'avatar.png' })]);

    expect(card.spaceImageUrl).toBe('card.png');
  });

  it('uses the avatar for depth 1 and 2 subspaces', () => {
    const [l1] = mapApplicationsToCards([
      pendingSpaceRequest('l1', { depth: 1, card: 'card.png', avatar: 'avatar.png' }),
    ]);
    const [l2] = mapApplicationsToCards([
      pendingSpaceRequest('l2', { depth: 2, card: 'card.png', avatar: 'avatar.png' }),
    ]);

    expect(l1.spaceImageUrl).toBe('avatar.png');
    expect(l2.spaceImageUrl).toBe('avatar.png');
  });

  it('treats an empty file url as "no image"', () => {
    const [l0] = mapApplicationsToCards([pendingSpaceRequest('l0', { card: '' })]);
    const [l1] = mapApplicationsToCards([pendingSpaceRequest('l1', { depth: 1, avatar: '' })]);

    expect(l0.spaceImageUrl).toBeUndefined();
    expect(l1.spaceImageUrl).toBeUndefined();
  });

  it('never substitutes one visual for the other when the right one is absent', () => {
    const [l0] = mapApplicationsToCards([pendingSpaceRequest('l0', { avatar: 'avatar.png' })]);
    const [l1] = mapApplicationsToCards([pendingSpaceRequest('l1', { depth: 1, card: 'card.png' })]);

    expect(l0.spaceImageUrl).toBeUndefined();
    expect(l1.spaceImageUrl).toBeUndefined();
  });

  it('carries name, href and a deterministic colour through', () => {
    const [card] = mapApplicationsToCards([pendingSpaceRequest('app')]);

    expect(card.spaceName).toBe('A Space');
    expect(card.spaceHref).toBe('/a-space');
    expect(card.color).toMatch(/^#/);
  });
});
