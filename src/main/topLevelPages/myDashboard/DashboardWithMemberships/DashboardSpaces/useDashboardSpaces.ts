import { useState } from 'react';
import { useDashboardWithMembershipsLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { useHomeSpaceSettings } from '@/domain/community/userCurrent/useHomeSpaceSettings';

const LIMIT = 8; // Hardcoded max value as this request is heavy

export const useDashboardSpaces = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSpaceName, setSelectedSpaceName] = useState('');
  const [selectedSpaceIdx, setSelectedSpaceIdx] = useState<number | null>(null);

  const [fetchDashboardWithMemberships, { data, loading, refetch }] = useDashboardWithMembershipsLazyQuery();

  const { homeSpaceId, membershipSettingsUrl } = useHomeSpaceSettings();

  // Reorder memberships so homeSpace is first
  const orderedMemberships = (() => {
    const memberships = data?.me.spaceMembershipsHierarchical ?? [];
    if (!homeSpaceId) return memberships;

    const homeSpaceIndex = memberships.findIndex(m => m.space.id === homeSpaceId);
    if (homeSpaceIndex <= 0) return memberships; // Already first or not found

    const reordered = [...memberships];
    const [homeSpace] = reordered.splice(homeSpaceIndex, 1);
    reordered.unshift(homeSpace);
    return reordered;
  })();

  const handleDialogOpen = (idx: number, displayName: string) => () => {
    setSelectedSpaceIdx(idx);
    setSelectedSpaceName(displayName);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => setIsDialogOpen(false);

  const fetchSpaces = (limit: number = LIMIT) => {
    fetchDashboardWithMemberships({ variables: { limit } });
  };

  const refetchSpaces = () => {
    refetch({ limit: LIMIT });
  };

  return {
    data,
    orderedMemberships,
    homeSpaceId,
    membershipSettingsUrl,
    loading,
    hasMore: data?.me.spaceMembershipsHierarchical?.length === LIMIT,
    fetchSpaces,
    refetchSpaces,
    isDialogOpen,
    selectedSpaceIdx,
    selectedSpaceName,
    handleDialogOpen,
    handleDialogClose,
  };
};
