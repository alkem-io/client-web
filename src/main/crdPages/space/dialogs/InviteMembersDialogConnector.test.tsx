import { act, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, test, vi } from 'vitest';
import {
  RoleSetInvitationResultNotice,
  RoleSetInvitationResultType,
  SpaceLevel,
} from '@/core/apollo/generated/graphql-schema';
import type { ContributorSelectorInvitee } from '@/crd/forms/ContributorSelector';
import type InvitationResultModel from '@/domain/access/model/InvitationResultModel';
import { InviteMembersDialogConnector, mapInvitationResults } from './InviteMembersDialogConnector';

// ---- Mocks for the connector-level VC-fetch regression test below ----

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { t: (key: string) => key } }),
}));

vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { id: 'viewer-1' } }),
}));

vi.mock('@/domain/platform/config/useConfig', () => ({ useConfig: () => ({ language: { eligible: [] } }) }));

vi.mock('@/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations', () => ({
  default: () => ({ invitations: [], inviteContributorsOnRoleSet: vi.fn(), loading: false }),
}));

vi.mock('@/domain/access/AvailableContributors/useRoleSetAvailableContributors', () => ({
  default: () => ({ findAvailableOrganizationsForRoleSet: vi.fn(async () => ({ organizations: [] })) }),
}));

vi.mock('@/domain/access/RoleSetManager/useRoleSetManager', async importOriginal => {
  const actual = await importOriginal<typeof import('@/domain/access/RoleSetManager/useRoleSetManager')>();
  return { ...actual, default: () => ({ organizations: [] }) };
});

vi.mock('@/domain/community/inviteContributors/components/FormikContributorsSelectorField/useContributors', () => ({
  useContributors: () => ({ data: [], hasMore: false, loading: false, fetchMore: vi.fn() }),
}));

// A VC already in the community — proves `currentMembers` reaches
// `useVirtualContributorsAdmin` non-empty once the community query resolves.
const existingVcMember = { id: 'vc-existing' };
vi.mock('@/domain/spaceAdmin/SpaceAdminCommunity/hooks/useCommunityAdmin', () => ({
  default: () => ({
    virtualContributorAdmin: { members: [existingVcMember], onAdd: vi.fn(), inviteContributors: vi.fn() },
  }),
}));

const getAvailableMock = vi.fn(async () => []);
const getAvailableInLibraryMock = vi.fn(async () => []);
const useVirtualContributorsAdminMock = vi.fn((_params: { level: SpaceLevel; currentMembers: { id: string }[] }) => ({
  virtualContributorAdmin: { getAvailable: getAvailableMock, getAvailableInLibrary: getAvailableInLibraryMock },
}));
vi.mock('@/domain/spaceAdmin/SpaceAdminCommunity/hooks/useVirtualContributorsAdmin', () => ({
  default: (params: { level: SpaceLevel; currentMembers: { id: string }[] }) => useVirtualContributorsAdminMock(params),
}));

vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({
  default: () => ({ spaceId: 'space-1', parentSpaceId: undefined }),
}));

// The space query — mutable so the test can simulate it resolving after the
// dialog opens (the render on which `open` flips true has no data yet).
let inviteUsersDialogQueryReturn: {
  data:
    | {
        lookup: {
          space: { about: { profile: { displayName: string }; membership: { roleSetID: string } } } & {
            level: SpaceLevel;
          };
        };
      }
    | undefined;
  loading: boolean;
} = { data: undefined, loading: true };
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useInviteUsersDialogQuery: () => inviteUsersDialogQueryReturn,
  useAvailableUsersForEntryRoleQuery: () => ({ data: undefined, loading: false, fetchMore: vi.fn() }),
}));

// Stub the presentational dialog — this test exercises the connector's data
// wiring only, not the CRD component's rendering.
vi.mock('@/crd/components/community/InviteMembersDialog', () => ({
  InviteMembersDialog: () => null,
}));

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

/**
 * Regression coverage: the virtualContributor kind's fetch effect must wait for
 * the space query (roleSetId/spaceLevel) to resolve before fetching, and must
 * re-run once it does — otherwise it fetches through the L0 branch on a
 * subspace and filters against an empty current-member set (corr-client-web-2).
 */
describe('InviteMembersDialogConnector — virtualContributor fetch waits for the resolved space', () => {
  test('does not fetch while the space query is still pending, then fetches with the resolved level once it settles', async () => {
    inviteUsersDialogQueryReturn = { data: undefined, loading: true };
    getAvailableMock.mockClear();
    useVirtualContributorsAdminMock.mockClear();

    let rerender!: (ui: ReactElement) => void;
    await act(async () => {
      ({ rerender } = render(
        <InviteMembersDialogConnector open={true} kind="virtualContributor" spaceId="space-1" onClose={vi.fn()} />
      ));
    });

    // Space query still pending on the render where `open` flips true — the
    // effect must not fetch yet, and the lookup hook must not have been
    // constructed with the L0 default while the resolved values are unknown.
    expect(getAvailableMock).not.toHaveBeenCalled();

    // The space query resolves: an L1 subspace with its own role set.
    inviteUsersDialogQueryReturn = {
      data: {
        lookup: {
          space: {
            about: { profile: { displayName: 'My Subspace' }, membership: { roleSetID: 'rs-1' } },
            level: SpaceLevel.L1,
          },
        },
      },
      loading: false,
    };
    await act(async () => {
      rerender(
        <InviteMembersDialogConnector open={true} kind="virtualContributor" spaceId="space-1" onClose={vi.fn()} />
      );
    });

    expect(getAvailableMock).toHaveBeenCalledTimes(1);
    // useVirtualContributorsAdmin must have been (re-)constructed with the
    // resolved L1 level, not the SpaceLevel.L0 fallback, and with the
    // community's actual (non-empty) current-member list.
    const calls = useVirtualContributorsAdminMock.mock.calls;
    const lastCallArgs = calls[calls.length - 1][0];
    expect(lastCallArgs.level).toBe(SpaceLevel.L1);
    expect(lastCallArgs.currentMembers).toEqual([{ id: 'vc-existing' }]);
  });
});
