import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import useSpaceDashboardNavigation from '@/domain/space/components/spaceDashboardNavigation/useSpaceDashboardNavigation';
import { useSpace } from '@/domain/space/context/useSpace';
import useSpaceTabProvider from '@/domain/space/layout/tabbedLayout/SpaceTabProvider';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

type UseCrdSpaceDashboardParams = {
  /** Suppresses every query this hook drives — the sidebar connector passes
   *  this when the `subspaceLinks` widget is not configured on the active
   *  tab (FR-019). */
  skip?: boolean;
};

export function useCrdSpaceDashboard({ skip }: UseCrdSpaceDashboardParams = {}) {
  const { spaceId } = useUrlResolver();
  const { permissions } = useSpace();

  const {
    calloutsSetId,
    classificationTagsets,
    flowStateForNewCallouts,
    tabDescription,
    loading: tabLoading,
  } = useSpaceTabProvider({ tabPosition: 0, skip });

  const calloutsSetProvided = useCalloutsSet({
    calloutsSetId,
    classificationTagsets,
    skip,
  });

  const { dashboardNavigation, loading: navLoading } = useSpaceDashboardNavigation({
    spaceId,
    skip,
  });

  return {
    callouts: calloutsSetProvided.callouts ?? [],
    calloutsSetId,
    canCreateCallout: calloutsSetProvided.canCreateCallout,
    canReorderCallouts:
      calloutsSetProvided.calloutsSetAuthorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false,
    tabDescription: tabDescription ?? '',
    dashboardNavigation,
    /** Only the subspace navigation fetch — `loading` also covers the tab + callouts-set queries. */
    navigationLoading: navLoading,
    flowStateForNewCallouts,
    loading: tabLoading || calloutsSetProvided.loading || navLoading,
    readUsersAccess: permissions.canRead,
    canEdit: permissions.canUpdate,
    refetchCallouts: calloutsSetProvided.refetchCallouts,
  };
}
