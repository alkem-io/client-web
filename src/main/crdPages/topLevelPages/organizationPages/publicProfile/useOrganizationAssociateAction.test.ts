import { ApolloError } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CommunityMembershipStatus,
  OrganizationAssociateEligibilityReason,
} from '@/core/apollo/generated/graphql-schema';

const runJoin = vi.fn();
const notify = vi.fn();

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notify }));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { id: 'me' } }),
}));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useJoinRoleSetMutation: () => [runJoin, { loading: false }],
  useUserPendingMembershipsQuery: () => ({ data: undefined, loading: false }),
}));

import { mapEligibilityToAction, useOrganizationAssociateAction } from './useOrganizationAssociateAction';

describe('mapEligibilityToAction (062, T004)', () => {
  it('maps every eligibility reason to its action', () => {
    const cases: [OrganizationAssociateEligibilityReason, string][] = [
      [OrganizationAssociateEligibilityReason.NotAuthenticated, 'login'],
      [OrganizationAssociateEligibilityReason.AlreadyAssociate, 'none'],
      [OrganizationAssociateEligibilityReason.InvitationPending, 'respond'],
      [OrganizationAssociateEligibilityReason.ApplicationPending, 'pending-application'],
      [OrganizationAssociateEligibilityReason.EligibleToJoin, 'join'],
      [OrganizationAssociateEligibilityReason.ApplicationsNotAccepted, 'closed'],
      [OrganizationAssociateEligibilityReason.ApplyNotGranted, 'closed'],
      [OrganizationAssociateEligibilityReason.EligibleToApply, 'apply'],
    ];
    for (const [reason, expected] of cases) {
      expect(mapEligibilityToAction(reason, undefined)).toBe(expected);
    }
  });

  it('lets the live membership status override the reason for the already-answered states', () => {
    expect(
      mapEligibilityToAction(OrganizationAssociateEligibilityReason.EligibleToApply, CommunityMembershipStatus.Member)
    ).toBe('none');
    expect(
      mapEligibilityToAction(
        OrganizationAssociateEligibilityReason.EligibleToApply,
        CommunityMembershipStatus.InvitationPending
      )
    ).toBe('respond');
    expect(
      mapEligibilityToAction(
        OrganizationAssociateEligibilityReason.EligibleToApply,
        CommunityMembershipStatus.ApplicationPending
      )
    ).toBe('pending-application');
  });

  it('defaults to none when the reason is unset', () => {
    expect(mapEligibilityToAction(undefined, undefined)).toBe('none');
  });
});

describe('useOrganizationAssociateAction — joining reports exactly one message per failure', () => {
  const renderJoin = () =>
    renderHook(() =>
      useOrganizationAssociateAction({
        organizationId: 'org-1',
        roleSetId: 'rs-1',
        eligibilityReason: OrganizationAssociateEligibilityReason.EligibleToJoin,
        membershipStatus: undefined,
        isAuthenticated: true,
        onJoined: vi.fn(),
      })
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('owns its error handling so the global link stays quiet, and toasts the eligibility refusal once', async () => {
    runJoin.mockRejectedValueOnce(
      new ApolloError({
        graphQLErrors: [{ message: 'not eligible', extensions: { code: 'ROLESET_JOIN_NOT_ELIGIBLE' } } as never],
      })
    );
    const { result } = renderJoin();

    await act(async () => {
      await result.current.onJoin();
    });

    expect(runJoin).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { roleSetId: 'rs-1' }, context: { skipGlobalErrorHandler: true } })
    );
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('orgProfile.associate.joinNotEligible', 'error');
  });

  it('toasts a generic join failure once', async () => {
    runJoin.mockRejectedValueOnce(new Error('nope'));
    const { result } = renderJoin();

    await act(async () => {
      await result.current.onJoin();
    });

    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('orgProfile.associate.joinError', 'error');
  });
});
