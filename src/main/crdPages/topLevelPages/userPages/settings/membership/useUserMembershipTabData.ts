import { useState } from 'react';
import {
  useRemoveRoleFromUserMutation,
  useSpaceContributionDetailsLazyQuery,
  useUpdateUserSettingsMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

export type MembershipFilter = 'all' | 'spaces' | 'subspaces';

export type PendingLeave = {
  membershipId: string;
  /** L0 space id used to look up the role-set. */
  spaceId: string;
  displayName: string;
};

export type UseUserMembershipTabDataResult = {
  search: string;
  filter: MembershipFilter;
  homeSpaceSaving: boolean;
  pendingLeave: PendingLeave | null;
  isLeaving: boolean;
  onSearchChange: (term: string) => void;
  onFilterChange: (filter: MembershipFilter) => void;
  onClearFilters: () => void;
  onSelectHomeSpace: (spaceId: string | null, currentAutoRedirect: boolean) => Promise<void>;
  onToggleAutoRedirect: (next: boolean) => Promise<void>;
  onRequestLeave: (row: PendingLeave) => void;
  onConfirmLeave: () => Promise<void>;
  onCancelLeave: () => void;
};

/**
 * Holds the User Membership tab's UI state + per-mutation callbacks. The
 * Apollo queries themselves live in the integration page (CrdUserMembershipTab)
 * — this hook owns only the imperative side-effect callbacks plus the
 * client-side search / filter / pagination cursor and the
 * pending-leave dialog state (Rule #9).
 *
 * Search / filter changes reset the page to 1.
 */
export const useUserMembershipTabData = (
  userId: string | undefined,
  refetchOnSettingsChange?: () => Promise<unknown>
): UseUserMembershipTabDataResult => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MembershipFilter>('all');
  const [homeSpaceSaving, setHomeSpaceSaving] = useState(false);
  const [pendingLeave, setPendingLeave] = useState<PendingLeave | null>(null);

  const [updateUserSettings] = useUpdateUserSettingsMutation();
  const [fetchSpaceDetails] = useSpaceContributionDetailsLazyQuery();
  const [removeRoleFromUser, { loading: isLeaving }] = useRemoveRoleFromUserMutation();

  const onSearchChange = (term: string) => setSearch(term);
  const onFilterChange = (next: MembershipFilter) => setFilter(next);
  const onClearFilters = () => {
    setSearch('');
    setFilter('all');
  };

  const onSelectHomeSpace = async (spaceId: string | null, currentAutoRedirect: boolean) => {
    if (!userId) return;
    setHomeSpaceSaving(true);
    try {
      await updateUserSettings({
        variables: {
          settingsData: {
            userID: userId,
            settings: {
              homeSpace: {
                spaceID: spaceId as string | undefined,
                // Clearing the home space auto-disables redirect (parity
                // with the existing MUI page behaviour).
                autoRedirect: spaceId ? currentAutoRedirect : false,
              },
            },
          },
        },
      });
    } finally {
      setHomeSpaceSaving(false);
    }
  };

  const onToggleAutoRedirect = async (next: boolean) => {
    if (!userId) return;
    setHomeSpaceSaving(true);
    try {
      await updateUserSettings({
        variables: {
          settingsData: {
            userID: userId,
            settings: { homeSpace: { autoRedirect: next } },
          },
        },
      });
    } finally {
      setHomeSpaceSaving(false);
    }
  };

  const onRequestLeave = (row: PendingLeave) => setPendingLeave(row);
  const onCancelLeave = () => setPendingLeave(null);

  const onConfirmLeave = async () => {
    if (!pendingLeave || !userId) return;
    // The role-set lives on the space's `about.membership.roleSetID`.
    // Lazy-fetched at confirm time so the table doesn't pre-fetch N
    // role-set ids on initial render.
    const result = await fetchSpaceDetails({ variables: { spaceId: pendingLeave.spaceId } });
    const roleSetId = result.data?.lookup.space?.about.membership.roleSetID;
    if (!roleSetId) {
      setPendingLeave(null);
      return;
    }
    await removeRoleFromUser({
      variables: { contributorId: userId, roleSetId, role: RoleName.Member },
      awaitRefetchQueries: true,
    });
    setPendingLeave(null);
    await refetchOnSettingsChange?.();
  };

  return {
    search,
    filter,
    homeSpaceSaving,
    pendingLeave,
    isLeaving,
    onSearchChange,
    onFilterChange,
    onClearFilters,
    onSelectHomeSpace,
    onToggleAutoRedirect,
    onRequestLeave,
    onConfirmLeave,
    onCancelLeave,
  };
};

export default useUserMembershipTabData;
