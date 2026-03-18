import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSpacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import FullWidthButton from '@/core/ui/button/FullWidthButton';
import PageContent from '@/core/ui/content/PageContent';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import { useScreenSize } from '@/core/ui/grid/constants';
import useApplicationButton from '@/domain/access/ApplicationsAndInvitations/useApplicationButton';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import ApplicationButton from '@/domain/community/applicationButton/ApplicationButton';
import CommunityUpdatesDialog from '@/domain/community/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import useSpaceDashboardNavigation from '@/domain/space/components/spaceDashboardNavigation/useSpaceDashboardNavigation';
import { useSpace } from '@/domain/space/context/useSpace';
import CalendarDialog from '@/domain/timeline/calendar/CalendarDialog';
import { buildSpaceSectionUrl, buildUpdatesUrl } from '@/main/routing/urlBuilders';
import useSpaceTabProvider from '../../SpaceTabProvider';
import SpaceDashboardView, { type SpaceDashboardSpaceDetails } from './SpaceDashboardView';

const SpaceDashboardPage = () => {
  const { classificationTagsets, flowStateForNewCallouts, calloutsSetId, tabDescription, loading } =
    useSpaceTabProvider({ tabPosition: 0 });

  const { isSmallScreen } = useScreenSize();

  const params = useParams();
  const { dialog } = params;
  const {
    space: { id: spaceId, level: spaceLevel },
  } = useSpace();

  const { platformPrivilegeWrapper: userWrapper } = useCurrentUserContext();

  const navigate = useNavigate();

  const { data: spacePageData, loading: loadingSpacePageQuery } = useSpacePageQuery({
    variables: {
      spaceId: spaceId,
    },
    errorPolicy: 'all',
    skip: !spaceId || spaceLevel !== SpaceLevel.L0 || loading,
  });

  const spaceData = spacePageData?.lookup.space;
  const backToDashboard = useCallback(
    () => navigate(buildSpaceSectionUrl(spaceData?.about.profile.url ?? '', 1), { replace: true }),
    [spaceData?.about.profile.url]
  );

  const spacePrivileges = spaceData?.authorization?.myPrivileges ?? [];

  const permissions = {
    canEdit: spacePrivileges.includes(AuthorizationPrivilege.Update),
    spaceReadAccess: spacePrivileges.includes(AuthorizationPrivilege.Read),
    readUsers: userWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.ReadUsers) ?? false,
  };

  const { dashboardNavigation, loading: dashboardNavigationLoading } = useSpaceDashboardNavigation({
    spaceId: spaceId,
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

  const { applicationButtonProps, loading: applicationButtonLoading } = useApplicationButton({ spaceId });

  const updatesUrl = buildUpdatesUrl(spaceData?.about.profile.url ?? '');
  const communityId = spaceData?.about.membership.communityID;

  return (
    <>
      {!loading && !applicationButtonProps.isMember && (
        <PageContent gridContainerProps={{ paddingBottom: 0 }} sx={{ flexGrow: 0 }}>
          <PageContentColumn columns={12}>
            <ApplicationButton
              {...applicationButtonProps}
              loading={applicationButtonLoading}
              component={FullWidthButton}
              extended={!isSmallScreen}
              spaceId={spaceId}
              spaceLevel={spaceLevel}
            />
          </PageContentColumn>
        </PageContent>
      )}

      <SpaceDashboardView
        space={space}
        tabDescription={tabDescription}
        dashboardNavigation={dashboardNavigation}
        dashboardNavigationLoading={dashboardNavigationLoading}
        canEdit={permissions.canEdit}
        readUsersAccess={permissions.readUsers}
        calloutsSetProvided={calloutsSetProvided}
        flowStateForNewCallouts={flowStateForNewCallouts}
        shareUpdatesUrl={updatesUrl}
      />
      {communityId && (
        <CommunityUpdatesDialog
          open={dialog === 'updates'}
          onClose={backToDashboard}
          communityId={communityId}
          shareUrl={updatesUrl}
          loading={loadingSpacePageQuery}
        />
      )}
      <CalendarDialog open={dialog === 'calendar'} onClose={backToDashboard} />
    </>
  );
};

export default SpaceDashboardPage;
