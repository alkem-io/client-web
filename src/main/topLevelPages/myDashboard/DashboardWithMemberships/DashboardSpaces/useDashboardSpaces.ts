import { useCallback, useState } from 'react';
import { useDashboardWithMembershipsLazyQuery } from '@/core/apollo/generated/apollo-hooks';

const LIMIT = 8; // Hardcoded max value as this request is heavy

export const useDashboardSpaces = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSpaceName, setSelectedSpaceName] = useState('');
  const [selectedSpaceIdx, setSelectedSpaceIdx] = useState<number | null>(null);

  const [fetchDashboardWithMemberships, { data, loading, refetch }] = useDashboardWithMembershipsLazyQuery();

  const handleDialogOpen = (idx: number, displayName: string) => () => {
    setSelectedSpaceIdx(idx);
    setSelectedSpaceName(displayName);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => setIsDialogOpen(false);

  const fetchSpaces = useCallback(
    (limit: number = LIMIT) => {
      fetchDashboardWithMemberships({ variables: { limit } });
    },
    [fetchDashboardWithMemberships]
  );

  const refetchSpaces = useCallback(() => {
    refetch({ limit: LIMIT });
  }, [refetch]);

  return {
    data,
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
