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
 * Leave removes the organization's Member role from the exact space or
 * subspace on the card, resolving its role set lazily at confirm time. A role
 * set that cannot be resolved is a failed leave, not a silent no-op, so the
 * caller can never report success for a request that was not sent. Whatever
 * the outcome, the dialog state is cleared and the memberships list refetched
 * so it reflects the organization's actual roles.
 */
export const useOrgMembershipTabData = (
  organizationId: string | undefined,
  refetchMemberships?: () => Promise<unknown>
): UseOrgMembershipTabDataResult => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MembershipFilter>('all');
  const [pendingLeave, setPendingLeave] = useState<OrgPendingLeave | null>(null);

  const [fetchSpaceDetails] = useSpaceContributionDetailsLazyQuery();
  const [removeRoleFromOrganization, { loading: isLeaving }] = useRemoveRoleFromOrganizationMutation();

  const onSearchChange = (term: string) => setSearch(term);
  const onFilterChange = (next: MembershipFilter) => setFilter(next);
  const onClearFilters = () => {
    setSearch('');
    setFilter('all');
  };

  const onRequestLeave = (row: OrgPendingLeave) => setPendingLeave(row);
  const onCancelLeave = () => setPendingLeave(null);

  const onConfirmLeave = async () => {
    if (!pendingLeave || !organizationId) {
      throw new Error('No membership selected to leave');
    }
    try {
      const result = await fetchSpaceDetails({ variables: { spaceId: pendingLeave.spaceId } });
      const roleSetId = result.data?.lookup.space?.about.membership.roleSetID;
      if (!roleSetId) {
        throw new Error('Role set of the space could not be resolved');
      }
      await removeRoleFromOrganization({
        variables: { contributorId: organizationId, roleSetId, role: RoleName.Member },
        awaitRefetchQueries: true,
      });
    } finally {
      setPendingLeave(null);
      await refetchMemberships?.();
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
