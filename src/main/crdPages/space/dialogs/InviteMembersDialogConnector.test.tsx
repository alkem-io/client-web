import { describe, expect, test } from 'vitest';
import { RoleSetInvitationResultNotice, RoleSetInvitationResultType } from '@/core/apollo/generated/graphql-schema';
import type { ContributorSelectorInvitee } from '@/crd/forms/ContributorSelector';
import type InvitationResultModel from '@/domain/access/model/InvitationResultModel';
import { mapInvitationResults } from './InviteMembersDialogConnector';

/**
 * Pure-function coverage for the result-correlation logic (T007). The server
 * returns one RoleSetInvitationResult per submitted invitee, in input order;
 * successful/failed-with-invitation results are matched by actor id, and
 * results that create nothing (opt-out, Lead limit, already member, ...) fall
 * back to the next id-less result in submission order.
 */
describe('mapInvitationResults', () => {
  test('organization invitee correlates by invitation.actor.id → sent', () => {
    const invitees: ContributorSelectorInvitee[] = [{ kind: 'organization', id: 'org-1', displayName: 'Acme' }];
    const legacyResults: InvitationResultModel[] = [
      { type: RoleSetInvitationResultType.InvitedToRoleSet, invitation: { id: 'inv-1', actor: { id: 'org-1' } } },
    ];
    const results = mapInvitationResults(invitees, legacyResults);
    expect(results).toEqual([{ invitee: invitees[0], outcome: 'sent' }]);
  });

  test('a sent result carrying the zero-admin notice surfaces notice: "noAdministrators"', () => {
    const invitees: ContributorSelectorInvitee[] = [{ kind: 'organization', id: 'org-1', displayName: 'Acme' }];
    const legacyResults: InvitationResultModel[] = [
      {
        type: RoleSetInvitationResultType.InvitedToRoleSet,
        notice: RoleSetInvitationResultNotice.OrganizationHasNoAdministrators,
        invitation: { id: 'inv-1', actor: { id: 'org-1' } },
      },
    ];
    const results = mapInvitationResults(invitees, legacyResults);
    expect(results).toEqual([{ invitee: invitees[0], outcome: 'sent', notice: 'noAdministrators' }]);
  });

  test('ORGANIZATION_NOT_ACCEPTING_INVITATIONS → notAcceptingInvitations (id-less result, submission-order fallback)', () => {
    const invitees: ContributorSelectorInvitee[] = [{ kind: 'organization', id: 'org-1', displayName: 'Acme' }];
    const legacyResults: InvitationResultModel[] = [
      { type: RoleSetInvitationResultType.OrganizationNotAcceptingInvitations },
    ];
    const results = mapInvitationResults(invitees, legacyResults);
    expect(results).toEqual([{ invitee: invitees[0], outcome: 'notAcceptingInvitations' }]);
  });

  test('ORGANIZATION_LEAD_ROLE_LIMIT_REACHED → leadLimitReached', () => {
    const invitees: ContributorSelectorInvitee[] = [{ kind: 'organization', id: 'org-1', displayName: 'Acme' }];
    const legacyResults: InvitationResultModel[] = [
      { type: RoleSetInvitationResultType.OrganizationLeadRoleLimitReached },
    ];
    const results = mapInvitationResults(invitees, legacyResults);
    expect(results).toEqual([{ invitee: invitees[0], outcome: 'leadLimitReached' }]);
  });

  test('a batch of organizations: matched-by-id results are consumed before id-less results are assigned in order', () => {
    const invitees: ContributorSelectorInvitee[] = [
      { kind: 'organization', id: 'org-1', displayName: 'Acme' },
      { kind: 'organization', id: 'org-2', displayName: 'Beta' },
      { kind: 'organization', id: 'org-3', displayName: 'Gamma' },
    ];
    // Server order need not match submission order; org-2 is a genuine success,
    // the other two invitees hit id-less no-op outcomes, consumed in order.
    const legacyResults: InvitationResultModel[] = [
      { type: RoleSetInvitationResultType.OrganizationNotAcceptingInvitations },
      { type: RoleSetInvitationResultType.InvitedToRoleSet, invitation: { id: 'inv-2', actor: { id: 'org-2' } } },
      { type: RoleSetInvitationResultType.OrganizationLeadRoleLimitReached },
    ];
    const results = mapInvitationResults(invitees, legacyResults);
    expect(results).toEqual([
      { invitee: invitees[0], outcome: 'notAcceptingInvitations' },
      { invitee: invitees[1], outcome: 'sent' },
      { invitee: invitees[2], outcome: 'leadLimitReached' },
    ]);
  });

  test('an unmatched invitee with no result left falls back to error', () => {
    const invitees: ContributorSelectorInvitee[] = [{ kind: 'organization', id: 'org-1', displayName: 'Acme' }];
    const results = mapInvitationResults(invitees, []);
    expect(results).toEqual([{ invitee: invitees[0], outcome: 'error' }]);
  });

  test('user and email invitees keep their existing correlation and outcomes', () => {
    const invitees: ContributorSelectorInvitee[] = [
      { kind: 'user', userId: 'u1', displayName: 'Alice' },
      { kind: 'email', email: 'bob@example.com' },
    ];
    const legacyResults: InvitationResultModel[] = [
      {
        type: RoleSetInvitationResultType.InvitedToPlatformAndRoleSet,
        platformInvitation: { id: 'pi-1', email: 'bob@example.com' },
      },
      { type: RoleSetInvitationResultType.InvitedToRoleSet, invitation: { id: 'inv-1', actor: { id: 'u1' } } },
    ];
    const results = mapInvitationResults(invitees, legacyResults);
    expect(results).toEqual([
      { invitee: invitees[0], outcome: 'sent' },
      { invitee: invitees[1], outcome: 'sent' },
    ]);
  });
});
