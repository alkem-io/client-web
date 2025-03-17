import { PropsWithChildren } from 'react';
import { useResolvedPath } from 'react-router-dom';
import SpaceDashboardContainer from './SpaceDashboardContainer';
import CommunityUpdatesDialog from '@/domain/community/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import ContributorsDialog from '@/domain/community/community/ContributorsDialog/ContributorsDialog';
import SpaceContributorsDialogContent from '@/domain/community/community/entities/SpaceContributorsDialogContent';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import SpacePageLayout from '../layout/SpacePageLayout';
import SpaceDashboardView from './SpaceDashboardView';
import CalendarDialog from '@/domain/timeline/calendar/CalendarDialog';
import SpaceAboutDialog from '@/domain/space/about/SpaceAboutDialog';
import { buildUpdatesUrl } from '@/main/routing/urlBuilders';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useBackToStaticPath } from '@/core/routing/useBackToPath';

const SpaceDashboardPage = ({
  dialog,
}: PropsWithChildren<{ dialog?: 'about' | 'updates' | 'contributors' | 'calendar' }>) => {
  const currentPath = useResolvedPath('..');

  const backToDashboard = useBackToStaticPath(`${currentPath.pathname}/dashboard` ?? '');

  // using the spaceId from here leads to side effects - updating requests with old spaceId
  const { journeyPath, calendarEventId } = useUrlResolver();

  return (
    <SpacePageLayout journeyPath={journeyPath} currentSection={EntityPageSection.Dashboard}>
      <SpaceDashboardContainer>
        {({ callouts, dashboardNavigation, about, ...entities }, state) => (
          <>
            <SpaceDashboardView
              spaceId={entities.space?.id}
              collaborationId={entities.space?.collaboration?.id}
              calloutsSetId={entities.space?.collaboration?.calloutsSet?.id}
              what={entities.space?.about.profile.description}
              dashboardNavigation={dashboardNavigation}
              dashboardNavigationLoading={state.loading}
              loading={state.loading}
              communityId={entities.space?.community?.id}
              communityReadAccess={entities.permissions.communityReadAccess}
              timelineReadAccess={entities.permissions.timelineReadAccess}
              entityReadAccess={entities.permissions.spaceReadAccess}
              readUsersAccess={entities.permissions.readUsers}
              leadUsers={entities.space?.community?.roleSet?.leadUsers ?? []}
              host={entities.provider}
              callouts={callouts}
              level={entities.space?.level}
              myMembershipStatus={entities.space?.community?.roleSet?.myMembershipStatus}
              shareUpdatesUrl={buildUpdatesUrl(entities.space?.about.profile.url ?? '')}
            />
            <CommunityUpdatesDialog
              open={dialog === 'updates'}
              onClose={backToDashboard}
              communityId={entities.space?.community?.id}
              shareUrl={buildUpdatesUrl(entities.space?.about.profile.url ?? '')}
              loading={state.loading}
            />
            <ContributorsDialog
              open={dialog === 'contributors'}
              onClose={backToDashboard}
              dialogContent={SpaceContributorsDialogContent}
            />
            {entities.permissions.timelineReadAccess && (
              <CalendarDialog
                open={dialog === 'calendar'}
                onClose={backToDashboard}
                journeyId={entities.space?.id}
                parentSpaceId={undefined}
                parentPath={entities.space?.about.profile.url ?? ''}
                calendarEventId={calendarEventId}
              />
            )}
            <SpaceAboutDialog
              open={dialog === 'about'}
              spaceId={entities.space?.id}
              spaceLevel={SpaceLevel.L0}
              about={about}
              sendMessageToCommunityLeads={entities.sendMessageToCommunityLeads}
              metrics={entities.space?.metrics}
              communityId={entities.space?.community?.id}
              loading={state.loading}
              leadUsers={entities.space?.community?.roleSet?.leadUsers}
              provider={entities.provider}
              leadOrganizations={entities.space?.community?.roleSet?.leadOrganizations}
              onClose={entities.permissions?.spaceReadAccess ? backToDashboard : undefined}
              hasReadPrivilege={entities.permissions?.spaceReadAccess}
              hasEditPrivilege={entities.permissions?.canEdit}
            />
          </>
        )}
      </SpaceDashboardContainer>
    </SpacePageLayout>
  );
};

export default SpaceDashboardPage;
