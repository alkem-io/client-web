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
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import SpacePageLayout from '@/domain/journey/space/layout/SpacePageLayout';
import SpaceDashboardView, { SpaceDashboardSpaceDetails } from './SpaceDashboardView';
import useSpaceTabProvider from '../../SpaceTabProvider';
import { useSendMessageToCommunityLeadsMutation, useSpacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import useSpaceDashboardNavigation from '@/domain/journey/space/spaceDashboardNavigation/useSpaceDashboardNavigation';
import { useSpace } from '@/domain/journey/space/SpaceContext/useSpace';
import { useUserContext } from '@/domain/community/user/hooks/useUserContext';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';

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

  const { spaceId, journeyPath, calendarEventId } = urlInfo;

  const { loading: loadingSpace, permissions: spacePermissions } = useSpace();
  const { user } = useUserContext();

  const { data: spacePageData, loading: loadingSpaceQuery } = useSpacePageQuery({
    variables: {
      spaceId: spaceId!,
      authorizedReadAccess: spacePermissions.canRead,
    },
    errorPolicy: 'all',
    skip: !spaceId,
  });

  const spaceData = spacePageData?.lookup.space;

  const spacePrivileges = spaceData?.authorization?.myPrivileges ?? [];

  const permissions = {
    canEdit: spacePrivileges.includes(AuthorizationPrivilege.Update),
    spaceReadAccess: spacePrivileges.includes(AuthorizationPrivilege.Read),
    readUsers: user?.hasPlatformPrivilege(AuthorizationPrivilege.ReadUsers) || false,
  };

  const { dashboardNavigation, loading: dashboardNavigationLoading } = useSpaceDashboardNavigation({
    spaceId: spaceId!, // spaceReadAccess implies presence of spaceId
    skip: !permissions.spaceReadAccess,
  });

  const communityId = spaceData?.community?.id ?? '';

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

  const space: SpaceDashboardSpaceDetails = {
    id: spaceId || '',
    level: spaceData?.level,
    about: spaceData?.about,
  };

  return (
    <SpacePageLayout journeyPath={journeyPath} currentSection={EntityPageSection.Dashboard}>
      <SpaceDashboardView
        space={space}
        dashboardNavigation={dashboardNavigation}
        dashboardNavigationLoading={dashboardNavigationLoading}
        loading={loadingSpace || loadingSpaceQuery}
        entityReadAccess={permissions.spaceReadAccess}
        readUsersAccess={permissions.readUsers}
        calloutsSetProvided={calloutsSetProvided}
        flowStateForNewCallouts={flowStateForNewCallouts}
        shareUpdatesUrl={buildUpdatesUrl(spaceData?.about.profile.url ?? '')}
      />
      <CommunityUpdatesDialog
        open={dialog === 'updates'}
        onClose={backToDashboard}
        communityId={spaceData?.community?.id}
        shareUrl={buildUpdatesUrl(spaceData?.about.profile.url ?? '')}
        loading={loadingSpace}
      />
      <ContributorsDialog
        open={dialog === 'contributors'}
        onClose={backToDashboard}
        dialogContent={SpaceContributorsDialogContent}
      />
      <CalendarDialog
        open={dialog === 'calendar'}
        onClose={backToDashboard}
        journeyId={spaceId}
        parentSpaceId={undefined}
        parentPath={spaceData?.about.profile.url ?? ''}
        calendarEventId={calendarEventId}
      />
      <SpaceAboutDialog
        open={dialog === 'about'}
        space={space}
        sendMessageToCommunityLeads={handleSendMessageToCommunityLeads}
        loading={loadingSpace}
      />
    </SpacePageLayout>
  );
};

export default SpaceDashboardPage;
