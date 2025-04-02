import { PropsWithChildren } from 'react';
import CommunityUpdatesDialog from '@/domain/community/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import CalendarDialog from '@/domain/timeline/calendar/CalendarDialog';
import { buildUpdatesUrl } from '@/main/routing/urlBuilders';
import { AuthorizationPrivilege, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import SpacePageLayout from '@/domain/space/layout/tabbedLayout/layout/SpacePageLayout';
import SpaceDashboardView, { SpaceDashboardSpaceDetails } from './SpaceDashboardView';
import useSpaceTabProvider from '../../SpaceTabProvider';
import { useSpacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import useSpaceDashboardNavigation from '@/domain/space/components/spaceDashboardNavigation/useSpaceDashboardNavigation';
import { useUserContext } from '@/domain/community/user/hooks/useUserContext';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import { useBackWithDefaultUrl } from '@/core/routing/useBackToPath';
import { TabbedLayoutDialogsType } from '../../TabbedLayoutPage';

const SpaceDashboardPage = ({ dialog }: PropsWithChildren<{ dialog?: TabbedLayoutDialogsType }>) => {
  const { urlInfo, classificationTagsets, flowStateForNewCallouts, calloutsSetId, tabDescription, loading } =
    useSpaceTabProvider({ tabPosition: 0 });

  const { spaceId, journeyPath, calendarEventId, spaceLevel } = urlInfo;

  const { user } = useUserContext();

  const { data: spacePageData, loading: loadingSpacePageQuery } = useSpacePageQuery({
    variables: {
      spaceId: spaceId!,
    },
    errorPolicy: 'all',
    skip: !spaceId || spaceLevel !== SpaceLevel.L0 || loading,
  });

  const spaceData = spacePageData?.lookup.space;
  const backToDashboard = useBackWithDefaultUrl(spaceData?.about.profile.url ?? '');

  const spacePrivileges = spaceData?.authorization?.myPrivileges ?? [];

  const permissions = {
    canEdit: spacePrivileges.includes(AuthorizationPrivilege.Update),
    spaceReadAccess: spacePrivileges.includes(AuthorizationPrivilege.Read),
    readUsers: user?.hasPlatformPrivilege(AuthorizationPrivilege.ReadUsers) || false,
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

  return (
    <SpacePageLayout journeyPath={journeyPath} currentSection={{ sectionIndex: 0 }}>
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
        shareUpdatesUrl={buildUpdatesUrl(spaceData?.about.profile.url ?? '')}
      />
      <CommunityUpdatesDialog
        open={dialog === 'updates'}
        onClose={backToDashboard}
        communityId={spaceData?.about.membership.communityID}
        shareUrl={buildUpdatesUrl(spaceData?.about.profile.url ?? '')}
        loading={loadingSpacePageQuery}
      />
      <CalendarDialog
        open={dialog === 'calendar'}
        onClose={backToDashboard}
        journeyId={spaceId}
        parentSpaceId={undefined}
        parentPath={spaceData?.about.profile.url ?? ''}
        calendarEventId={calendarEventId}
      />
    </SpacePageLayout>
  );
};

export default SpaceDashboardPage;
