import { PropsWithChildren, useCallback } from 'react';
import { useResolvedPath } from 'react-router-dom';
import CommunityUpdatesDialog from '@/domain/community/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import ContributorsDialog from '@/domain/community/community/ContributorsDialog/ContributorsDialog';
import SpaceContributorsDialogContent from '@/domain/community/community/entities/SpaceContributorsDialogContent';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import useBackToParentPage from '@/core/routing/deprecated/useBackToParentPage';
import CalendarDialog from '@/domain/timeline/calendar/CalendarDialog';
import SpaceAboutDialog from '@/domain/space/about/SpaceAboutDialog';
import { buildUpdatesUrl } from '@/main/routing/urlBuilders';
import { AuthorizationPrivilege, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import SpacePageLayout from '@/domain/journey/space/layout/SpacePageLayout';
import SpaceDashboardView from './SpaceDashboardView';
import useSpaceTabProvider from '../../SpaceTabProvider';
import { useSendMessageToCommunityLeadsMutation, useSpacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import useSpaceDashboardNavigation from '@/domain/journey/space/spaceDashboardNavigation/useSpaceDashboardNavigation';
import { useSpace } from '@/domain/journey/space/SpaceContext/useSpace';
import { useUserContext } from '@/domain/community/user/hooks/useUserContext';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import { SpaceAboutDetailsModel } from '@/domain/space/about/model/spaceAboutFull.model';
import { ContributorViewProps } from '@/domain/community/community/EntityDashboardContributorsSection/Types';

const SpaceDashboardPage = ({
  dialog,
}: PropsWithChildren<{ dialog?: 'about' | 'updates' | 'contributors' | 'calendar' }>) => {
  const currentPath = useResolvedPath('..');

  const [backToDashboard] = useBackToParentPage(`${currentPath.pathname}/dashboard`);

  const {
    urlInfo,
    classificationTagsets,
    flowStateForNewCallouts,
    calloutsSetId,
    canSaveAsTemplate,
    entitledToSaveAsTemplate,
  } = useSpaceTabProvider({ tabPosition: 0 });

  const { spaceId, collaborationId, journeyPath, calendarEventId } = urlInfo;

  const { loading: loadingSpace, permissions: spacePermissions } = useSpace();
  const { user } = useUserContext();

  const { data: spaceData, loading: loadingSpaceQuery } = useSpacePageQuery({
    variables: {
      spaceId: spaceId!,
      authorizedReadAccess: spacePermissions.canRead,
      authorizedReadAccessCommunity: spacePermissions.canReadCommunity,
    },
    errorPolicy: 'all',
    skip: !spaceId,
  });

  const space = spaceData?.lookup.space;

  const communityReadAccess = (space?.community?.authorization?.myPrivileges ?? []).includes(
    AuthorizationPrivilege.Read
  );

  const timelineReadAccess = (space?.collaboration?.timeline?.authorization?.myPrivileges ?? []).includes(
    AuthorizationPrivilege.Read
  );

  const spacePrivileges = space?.authorization?.myPrivileges ?? [];

  const permissions = {
    canEdit: spacePrivileges.includes(AuthorizationPrivilege.Update),
    communityReadAccess,
    timelineReadAccess,
    spaceReadAccess: spacePrivileges.includes(AuthorizationPrivilege.Read),
    readUsers: user?.hasPlatformPrivilege(AuthorizationPrivilege.ReadUsers) || false,
  };

  const { dashboardNavigation, loading: dashboardNavigationLoading } = useSpaceDashboardNavigation({
    spaceId: spaceId!, // spaceReadAccess implies presence of spaceId
    skip: !permissions.spaceReadAccess,
  });

  const communityId = space?.community?.id ?? '';

  const [sendMessageToCommunityLeads] = useSendMessageToCommunityLeadsMutation();

  const handleSendMessageToCommunityLeads = useCallback(
    async (messageText: string) => {
      await sendMessageToCommunityLeads({
        variables: {
          messageData: {
            message: messageText,
            communityId: communityId,
          },
        },
      });
    },
    [sendMessageToCommunityLeads, communityId]
  );

  const calloutsSetProvided = useCalloutsSet({
    calloutsSetId,
    classificationTagsets,
    canSaveAsTemplate,
    entitledToSaveAsTemplate,
    includeClassification: true,
  });

  const about: SpaceAboutDetailsModel = space?.about!;

  const provider: ContributorViewProps | undefined = undefined;

  return (
    <SpacePageLayout journeyPath={journeyPath} currentSection={EntityPageSection.Dashboard}>
      <SpaceDashboardView
        spaceId={spaceId}
        collaborationId={collaborationId}
        calloutsSetId={space?.collaboration?.calloutsSet?.id}
        what={space?.about.profile.description}
        dashboardNavigation={dashboardNavigation}
        dashboardNavigationLoading={dashboardNavigationLoading}
        loading={loadingSpace || loadingSpaceQuery}
        communityId={space?.community?.id}
        communityReadAccess={permissions.communityReadAccess}
        timelineReadAccess={permissions.timelineReadAccess}
        entityReadAccess={permissions.spaceReadAccess}
        readUsersAccess={permissions.readUsers}
        leadUsers={space?.community?.roleSet?.leadUsers ?? []}
        host={provider}
        calloutsSetProvided={calloutsSetProvided}
        flowStateForNewCallouts={flowStateForNewCallouts}
        classificationTagsets={classificationTagsets}
        level={space?.level}
        myMembershipStatus={space?.community?.roleSet?.myMembershipStatus}
        shareUpdatesUrl={buildUpdatesUrl(space?.about.profile.url ?? '')}
      />
      <CommunityUpdatesDialog
        open={dialog === 'updates'}
        onClose={backToDashboard}
        communityId={space?.community?.id}
        shareUrl={buildUpdatesUrl(space?.about.profile.url ?? '')}
        loading={loadingSpace}
      />
      <ContributorsDialog
        open={dialog === 'contributors'}
        onClose={backToDashboard}
        dialogContent={SpaceContributorsDialogContent}
      />
      {permissions.timelineReadAccess && (
        <CalendarDialog
          open={dialog === 'calendar'}
          onClose={backToDashboard}
          journeyId={spaceId}
          parentSpaceId={undefined}
          parentPath={space?.about.profile.url ?? ''}
          calendarEventId={calendarEventId}
        />
      )}
      <SpaceAboutDialog
        open={dialog === 'about'}
        spaceLevel={SpaceLevel.L0}
        about={about}
        sendMessageToCommunityLeads={handleSendMessageToCommunityLeads}
        metrics={space?.metrics}
        loading={loadingSpace}
        leadUsers={space?.community?.roleSet?.leadUsers}
        provider={provider}
        leadOrganizations={space?.community?.roleSet?.leadOrganizations}
      />
    </SpacePageLayout>
  );
};

export default SpaceDashboardPage;
