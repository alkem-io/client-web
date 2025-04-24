import { PropsWithChildren, useCallback } from 'react';
import CommunityUpdatesDialog from '@/domain/community/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import CalendarDialog from '@/domain/timeline/calendar/CalendarDialog';
import { buildSpaceSectionUrl } from '@/main/routing/urlBuilders';
import { AuthorizationPrivilege, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import SpacePageLayout from '@/domain/space/layout/tabbedLayout/layout/SpacePageLayout';
import SpaceDashboardView, { SpaceDashboardSpaceDetails } from './SpaceDashboardView';
import useSpaceTabProvider from '../../SpaceTabProvider';
import { useSpacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import useSpaceDashboardNavigation from '@/domain/space/components/spaceDashboardNavigation/useSpaceDashboardNavigation';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import { TabbedLayoutDialogsType } from '../../TabbedLayoutPage';
import useNavigate from '@/core/routing/useNavigate';

const SpaceDashboardPage = ({ dialog }: PropsWithChildren<{ dialog?: TabbedLayoutDialogsType }>) => {
  const { urlInfo, classificationTagsets, flowStateForNewCallouts, calloutsSetId, tabDescription, loading } =
    useSpaceTabProvider({ tabPosition: 0 });

  const { spaceId, spaceHierarchyPath: journeyPath, calendarEventId, spaceLevel } = urlInfo;

  const { platformPrivilegeWrapper: userWrapper } = useCurrentUserContext();

  const navigate = useNavigate();

  const { data: spacePageData, loading: loadingSpacePageQuery } = useSpacePageQuery({
    variables: {
      spaceId: spaceId!,
    },
    errorPolicy: 'all',
    skip: !spaceId || spaceLevel !== SpaceLevel.L0 || loading,
  });

  const spaceData = spacePageData?.lookup.space;
  const backToDashboard = useCallback(
    () => navigate(buildSpaceSectionUrl(spaceData?.about.profile.url ?? '', 1)),
    [spaceData?.about.profile.url]
  );

  const spacePrivileges = spaceData?.authorization?.myPrivileges ?? [];

  const permissions = {
    canEdit: spacePrivileges.includes(AuthorizationPrivilege.Update),
    spaceReadAccess: spacePrivileges.includes(AuthorizationPrivilege.Read),
    readUsers: userWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.ReadUsers) ?? false,
  };

  const { dashboardNavigation, loading: dashboardNavigationLoading } = useSpaceDashboardNavigation({
    spaceId: spaceId!,
  });

  const calloutsSetProvided = useCalloutsSet({
    calloutsSetId,
    classificationTagsets,
  });

  const space: SpaceDashboardSpaceDetails = {
    id: spaceId || '',
    level: spaceData?.level,
    about: spaceData?.about,
  };

  const updatesUrl = buildSpaceSectionUrl(spaceData?.about.profile.url ?? '', 1, 'updates');

  return (
    <SpacePageLayout spaceHierarchyPath={journeyPath} currentSection={{ sectionIndex: 0 }}>
      <SpaceDashboardView
        space={space}
        tabDescription={tabDescription}
        dashboardNavigation={dashboardNavigation}
        dashboardNavigationLoading={dashboardNavigationLoading}
        loading={loadingSpacePageQuery}
        entityReadAccess={permissions.spaceReadAccess}
        readUsersAccess={permissions.readUsers}
        canEdit={permissions.canEdit}
        calloutsSetProvided={calloutsSetProvided}
        flowStateForNewCallouts={flowStateForNewCallouts}
        shareUpdatesUrl={updatesUrl}
      />
      <CommunityUpdatesDialog
        open={dialog === 'updates'}
        onClose={backToDashboard}
        communityId={spaceData?.about.membership.communityID}
        shareUrl={updatesUrl}
        loading={loadingSpacePageQuery}
      />
      <CalendarDialog
        open={dialog === 'calendar'}
        onClose={backToDashboard}
        spaceId={spaceId}
        parentSpaceId={undefined}
        parentPath={spaceData?.about.profile.url ?? ''}
        calendarEventId={calendarEventId}
      />
    </SpacePageLayout>
  );
};

export default SpaceDashboardPage;
