/**
 * useSelectionCandidates (feature 025, T005/T006)
 *
 * Derives the picker candidate set for the custom-selection mode of a
 * contributor-collection callout.  Consumes ONLY the already-shipped
 * host-scoped `RoleSetRoleAssignment` query (R-6, dissent afterlife) —
 * no new GraphQL documents, no platform-wide fetches.
 *
 * The hook returns:
 *  - `candidates`: the eligible set filtered to the callout's configured
 *    contributor types (for the picker display — FR-005).
 *  - `loading`: whether the role-set data is still in flight.
 *  - `resolveChips`: given `selectedIds` (from form state), returns the
 *    corresponding chip entries (eligible + ineligible) against the FULL
 *    all-types membership set (not the configured-types subset) — so that
 *    removing a type from the callout config does NOT cause still-member
 *    actors of that type to be marked ineligible on the next save (FR-011:
 *    the write-time scope guard checks space membership only, not type
 *    membership).
 *  - `filterCandidates(query)`: client-side name search over the candidate
 *    set (FR-008 pattern — search over the already-fetched set).
 *  - `refetch`: imperatively re-run the query (used on save failure to
 *    reload membership data so a departed member is removed from the
 *    candidate set and the next eligibility strip can succeed — spec Edge
 *    Case 'Concurrent churn', T005).
 *
 * HARD CRITERION (R-6): this hook MUST NOT add any new GraphQL document,
 * new query hook, or new server field.  It is read-only; it owns zero
 * mutations.
 */
import { useRoleSetRoleAssignmentQuery } from '@/core/apollo/generated/apollo-hooks';
import { ActorType, RoleName } from '@/core/apollo/generated/graphql-schema';
import type { ContributorSelectorInvitee } from '@/crd/forms/ContributorSelector';
import type { ContributorTypeId } from '@/crd/forms/callout/types';

/** A candidate entry in the picker. */
export type SelectionCandidate = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  kind: 'user' | 'organization' | 'virtualContributor';
};

type UseSelectionCandidatesOptions = {
  /** The host space's roleSet id — from `useSpace().space.about.membership?.roleSetID`. */
  roleSetId: string | undefined;
  /**
   * Contributor types currently configured on the callout.
   * Only members whose kind matches one of these types appear in `candidates`
   * (picker display, FR-005).  The eligibility map used by `resolveChips`
   * always covers all three types (FR-011: type-membership is a read-time
   * concern, not an eligibility gate).
   */
  contributorTypes: ContributorTypeId[];
  /** Skip all fetching (e.g. when the form is closed or the mode is 'auto'). */
  skip?: boolean;
};

type UseSelectionCandidatesResult = {
  candidates: SelectionCandidate[];
  loading: boolean;
  /**
   * Given the currently-saved `selectedIds` array, return the chip entries
   * for the picker.  Ids still present in the all-types membership set are
   * returned as `eligible: true`; ids that can no longer be found (member
   * left, entity deleted) are returned as `eligible: false` so the UI can
   * show the "no longer available" chip state and omit them on submit.
   *
   * Note: eligibility is checked against the full all-types membership set,
   * not just the callout's configured contributor types (FR-011).
   */
  resolveChips: (selectedIds: string[]) => ContributorSelectorInvitee[];
  /**
   * Returns the candidates whose `displayName` contains the given search
   * query (case-insensitive).  Empty string → all candidates.
   */
  filterCandidates: (query: string) => SelectionCandidate[];
  /**
   * Imperatively re-fetches the membership data.  Call this on save failure
   * (concurrent-churn recovery) so a departed member is removed from the
   * candidate set and the next eligibility strip in saveEdit can succeed.
   */
  refetch: () => void;
};

const ALL_ROLES: RoleName[] = [RoleName.Admin, RoleName.Lead, RoleName.Member];

export function useSelectionCandidates({
  roleSetId,
  contributorTypes,
  skip = false,
}: UseSelectionCandidatesOptions): UseSelectionCandidatesResult {
  // Always fetch all three contributor types so that `resolveChips` can check
  // space membership independently of the callout's configured types (FR-011).
  // The `candidates` array returned to the picker is then filtered to the
  // configured types for display purposes (FR-005).
  const {
    data,
    loading,
    refetch: rawRefetch,
  } = useRoleSetRoleAssignmentQuery({
    variables: {
      roleSetId: roleSetId ?? '',
      roles: ALL_ROLES,
      includeUsers: true,
      includeOrganizations: true,
      includeVirtualContributors: true,
    },
    skip: skip || !roleSetId,
  });

  const roleSet = data?.lookup.roleSet;

  // Build the full all-types membership map (used for eligibility checks).
  // De-duplicate by id across roles — a member may appear under Admin + Member.
  const allMembersById = new Map<string, SelectionCandidate>();

  if (roleSet?.usersInRoles) {
    for (const entry of roleSet.usersInRoles) {
      for (const user of entry.users) {
        if (!allMembersById.has(user.id)) {
          allMembersById.set(user.id, {
            id: user.id,
            displayName: user.profile?.displayName ?? user.id,
            avatarUrl: user.profile?.avatar?.uri ?? undefined,
            kind: 'user',
          });
        }
      }
    }
  }

  if (roleSet?.organizationsInRoles) {
    for (const entry of roleSet.organizationsInRoles) {
      for (const org of entry.organizations) {
        if (!allMembersById.has(org.id)) {
          allMembersById.set(org.id, {
            id: org.id,
            displayName: org.profile?.displayName ?? org.id,
            avatarUrl: org.profile?.avatar?.uri ?? undefined,
            kind: 'organization',
          });
        }
      }
    }
  }

  if (roleSet?.virtualContributorsInRoles) {
    for (const entry of roleSet.virtualContributorsInRoles) {
      for (const vc of entry.virtualContributors) {
        if (!allMembersById.has(vc.id)) {
          allMembersById.set(vc.id, {
            id: vc.id,
            displayName: vc.profile?.displayName ?? vc.id,
            avatarUrl: vc.profile?.avatar?.uri ?? undefined,
            kind: 'virtualContributor',
          });
        }
      }
    }
  }

  // Filter to configured types for picker display (FR-005).
  const candidates = Array.from(allMembersById.values()).filter(c => contributorTypes.includes(c.kind));

  // resolveChips uses the full all-types map so that an id belonging to a
  // still-valid community member is never marked ineligible just because its
  // contributor type is not currently included in the callout's type config.
  const resolveChips = (selectedIds: string[]): ContributorSelectorInvitee[] => {
    return selectedIds.map(id => {
      const found = allMembersById.get(id);
      if (found) {
        if (found.kind === 'user') {
          return {
            kind: 'user' as const,
            userId: found.id,
            displayName: found.displayName,
            avatarUrl: found.avatarUrl,
            eligible: true,
          };
        }
        if (found.kind === 'organization') {
          return {
            kind: 'organization' as const,
            id: found.id,
            displayName: found.displayName,
            avatarUrl: found.avatarUrl,
            eligible: true,
          };
        }
        // virtualContributor
        return {
          kind: 'virtualContributor' as const,
          id: found.id,
          displayName: found.displayName,
          avatarUrl: found.avatarUrl,
          eligible: true,
        };
      }
      // Stale entry — no longer in the authorized set.  Surface as ineligible
      // so the admin can remove it before saving (US1-AS6, stale-entry omission).
      // We don't know the kind of a stale id, so we surface it as a virtual-
      // contributor chip (it has no email field so it won't be added to the
      // email-invite path) — the display name is "…" and the ineligible indicator
      // is the only visible signal.
      return {
        kind: 'virtualContributor' as const,
        id,
        displayName: id,
        eligible: false,
      };
    });
  };

  const filterCandidates = (query: string): SelectionCandidate[] => {
    if (!query.trim()) return candidates;
    const lower = query.toLowerCase();
    return candidates.filter(c => c.displayName.toLowerCase().includes(lower));
  };

  const refetch = () => {
    void rawRefetch();
  };

  return { candidates, loading, resolveChips, filterCandidates, refetch };
}

/**
 * Omit ineligible (stale) ids from a `selectedIds` list before submit.
 * A stale entry has `eligible === false`; it must not be sent to the server
 * because the server strictly rejects out-of-scope ids.
 */
export function omitIneligibleIds(selectedIds: string[], chips: ContributorSelectorInvitee[]): string[] {
  const ineligibleSet = new Set<string>();
  for (const c of chips) {
    if (c.kind === 'email') continue;
    if (c.eligible !== false) continue;
    if (c.kind === 'user') {
      ineligibleSet.add(c.userId);
    } else {
      ineligibleSet.add(c.id);
    }
  }
  return selectedIds.filter(id => !ineligibleSet.has(id));
}

/** Map an ActorType → ContributorTypeId (used when restricting by configured types). */
export function actorTypeToContributorTypeId(actor: ActorType): ContributorTypeId | undefined {
  if (actor === ActorType.User) return 'user';
  if (actor === ActorType.Organization) return 'organization';
  if (actor === ActorType.VirtualContributor) return 'virtualContributor';
  return undefined;
}
