import { describe, expect, it } from 'vitest';
import {
  CommunityMembershipStatus,
  OrganizationAssociateEligibilityReason,
} from '@/core/apollo/generated/graphql-schema';
import { mapEligibilityToAction } from './useOrganizationAssociateAction';

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
