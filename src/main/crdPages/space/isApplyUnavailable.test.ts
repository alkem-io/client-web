import { describe, expect, test } from 'vitest';
import type { SpaceAboutApplyButtonProps } from '@/crd/components/space/SpaceAboutApplyButton';
import { isApplyUnavailable } from './isApplyUnavailable';

type ButtonState = Omit<SpaceAboutApplyButtonProps, 'className'>;

// Signed-in non-member of an invitation-only community: nothing to do, nothing pending.
const invitationOnly: ButtonState = {
  isAuthenticated: true,
  isMember: false,
  isParentMember: false,
  canJoinCommunity: false,
  canAcceptInvitation: false,
  canApplyToCommunity: false,
  canJoinParentCommunity: false,
  canApplyToParentCommunity: false,
  isApplicationPending: false,
  isParentApplicationPending: false,
  loading: false,
};

describe('isApplyUnavailable', () => {
  test('invitation-only community, nothing actionable → hidden', () => {
    expect(isApplyUnavailable(invitationOnly)).toBe(true);
  });

  test('member of the parent but nothing possible here → hidden', () => {
    expect(isApplyUnavailable({ ...invitationOnly, isParentMember: true })).toBe(true);
  });

  test('member of the parent hides even a parent-level action (button shows the disabled state first)', () => {
    expect(isApplyUnavailable({ ...invitationOnly, isParentMember: true, canApplyToParentCommunity: true })).toBe(true);
  });

  test.each<[string, Partial<ButtonState>]>([
    ['still loading', { loading: true }],
    ['not signed in (sign-in button)', { isAuthenticated: false }],
    ['already a member', { isMember: true }],
    ['has an invitation to accept', { canAcceptInvitation: true }],
    ['can join', { canJoinCommunity: true }],
    ['application pending', { isApplicationPending: true }],
    ['can apply', { canApplyToCommunity: true }],
    ['parent application pending', { isParentApplicationPending: true }],
    ['can join the parent', { canJoinParentCommunity: true }],
    ['can apply to the parent', { canApplyToParentCommunity: true }],
  ])('%s → stays visible', (_label, overrides) => {
    expect(isApplyUnavailable({ ...invitationOnly, ...overrides })).toBe(false);
  });
});
