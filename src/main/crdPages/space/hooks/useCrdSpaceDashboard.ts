import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import useSpaceDashboardNavigation from '@/domain/space/components/spaceDashboardNavigation/useSpaceDashboardNavigation';
import { useSpace } from '@/domain/space/context/useSpace';
import useSpaceTabProvider from '@/domain/space/layout/tabbedLayout/SpaceTabProvider';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

export function useCrdSpaceDashboard() {
  const { spaceId } = useUrlResolver();
  const { permissions } = useSpace();

  const {
    calloutsSetId,
    classificationTagsets,
    flowStateForNewCallouts,
    tabDescription,
    loading: tabLoading,
  } = useSpaceTabProvider({ tabPosition: 0 });

  const calloutsSetProvided = useCalloutsSet({
    calloutsSetId,
    classificationTagsets,
  });

  const { dashboardNavigation, loading: navLoading } = useSpaceDashboardNavigation({
    spaceId,
  });

  return {
    callouts: calloutsSetProvided.callouts ?? [],
    calloutsSetId,
    canCreateCallout: calloutsSetProvided.canCreateCallout,
    tabDescription: tabDescription ?? '',
    dashboardNavigation,
    flowStateForNewCallouts,
    loading: tabLoading || calloutsSetProvided.loading || navLoading,
    readUsersAccess: permissions.canRead,
    canEdit: permissions.canUpdate,
    refetchCallouts: calloutsSetProvided.refetchCallouts,
  };
}
