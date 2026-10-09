import { useState } from 'react';
import {
  useRemoveRoleFromOrganizationMutation,
  useSpaceContributionDetailsLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import type { MembershipFilter } from '@/crd/components/contributor/settings/MembershipsSection.types';

export type OrgPendingLeave = {
  membershipId: string;
  /** Id of the space or subspace whose role set the organization leaves. */
  spaceId: string;
  displayName: string;
};

export type UseOrgMembershipTabDataResult = {
  search: string;
  filter: MembershipFilter;
  pendingLeave: OrgPendingLeave | null;
  /** True for the whole confirm sequence: role-set lookup, removal and memberships refetch. */
  isLeaving: boolean;
  onSearchChange: (term: string) => void;
  onFilterChange: (filter: MembershipFilter) => void;
  onClearFilters: () => void;
  onRequestLeave: (row: OrgPendingLeave) => void;
  /** Resolves only once the organization has actually been removed; rejects on every other outcome. */
  onConfirmLeave: () => Promise<void>;
  onCancelLeave: () => void;
};

/**
 * UI state + Leave side effect for the organization Membership tab. The
 * memberships query lives in the integration page; this hook owns the
 * client-side search / filter and the pending-leave dialog state.
 *
 * Leave removes the organization from the exact space or subspace on the card
 * — every role it holds there and in all of its subspaces — resolving its role
 * set lazily at confirm time. A role set that cannot be resolved is a failed
 * leave, not a silent no-op, so the caller can never report success for a
 * request that was not sent. Whatever
 * the outcome, the memberships list is refetched (best effort) so it reflects
 * the organization's actual roles, and only then is the dialog state cleared:
 * `isLeaving` covers the whole sequence, so the dialog stays busy and the card
 * cannot be left a second time before the list has caught up.
 */
export const useOrgMembershipTabData = (
  organizationId: string | undefined,
  refetchMemberships?: () => Promise<unknown>
): UseOrgMembershipTabDataResult => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MembershipFilter>('all');
  const [pendingLeave, setPendingLeave] = useState<OrgPendingLeave | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  const [fetchSpaceDetails] = useSpaceContributionDetailsLazyQuery();
  const [removeRoleFromOrganization] = useRemoveRoleFromOrganizationMutation();

  const onSearchChange = (term: string) => setSearch(term);
  const onFilterChange = (next: MembershipFilter) => setFilter(next);
  const onClearFilters = () => {
    setSearch('');
    setFilter('all');
  };

  const onRequestLeave = (row: OrgPendingLeave) => setPendingLeave(row);
  const onCancelLeave = () => setPendingLeave(null);

  const onConfirmLeave = async () => {
    const leaving = pendingLeave;
    if (!leaving || !organizationId) {
      throw new Error('No membership selected to leave');
    }
    setIsLeaving(true);
    try {
      const result = await fetchSpaceDetails({ variables: { spaceId: leaving.spaceId } });
      const roleSetId = result.data?.lookup.space?.about.membership.roleSetID;
      if (!roleSetId) {
        throw new Error('Role set of the space could not be resolved');
      }
      // Removing MEMBER removes every role the organization holds in the
      // space (Lead included) and in all of its subspaces — the server owns
      // that cascade.
      await removeRoleFromOrganization({
        variables: { contributorId: organizationId, roleSetId, role: RoleName.Member },
      });
    } finally {
      // The leave's outcome is decided above: a failed refetch must neither
      // turn a completed leave into an error nor mask why the leave failed.
      await refetchMemberships?.().catch(() => undefined);
      // Clear only the dialog this confirm belongs to, never one opened since.
      setPendingLeave(current => (current === leaving ? null : current));
      setIsLeaving(false);
    }
  };

  return {
    search,
    filter,
    pendingLeave,
    isLeaving,
    onSearchChange,
    onFilterChange,
    onClearFilters,
    onRequestLeave,
    onConfirmLeave,
    onCancelLeave,
  };
};

export default useOrgMembershipTabData;
