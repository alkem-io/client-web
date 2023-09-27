import React, { FC } from 'react';
import { useResolvedPath } from 'react-router-dom';
import SpaceDashboardContainer from './SpaceDashboardContainer';
import CommunityUpdatesDialog from '../../../community/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import ContributorsDialog from '../../../community/community/ContributorsDialog/ContributorsDialog';
import SpaceContributorsDialogContent from '../../../community/community/entities/SpaceContributorsDialogContent';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';
import SpacePageLayout from '../layout/SpacePageLayout';
import SpaceDashboardView from './SpaceDashboardView';
import CalendarDialog from '../../../timeline/calendar/CalendarDialog';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import useSpaceDashboardNavigation from '../SpaceDashboardNavigation/useSpaceDashboardNavigation';

export interface SpaceDashboardPageProps {
  dialog?: 'updates' | 'contributors' | 'calendar';
}

const SpaceDashboardPage: FC<SpaceDashboardPageProps> = ({ dialog }) => {
  const currentPath = useResolvedPath('..');

  const [backToDashboard] = useBackToParentPage(`${currentPath.pathname}/dashboard`);

  const { spaceNameId } = useUrlParams();

  if (!spaceNameId) {
    throw new Error('Param :spaceNameId is missing');
  }

  const { dashboardNavigation, loading: dashboardNavigationLoading } = useSpaceDashboardNavigation({
    spaceId: spaceNameId,
  });

  return (
    <SpacePageLayout currentSection={EntityPageSection.Dashboard}>
      <SpaceDashboardContainer>
        {({ callouts, ...entities }, state) => (
          <>
            <SpaceDashboardView
              vision={entities.space?.context?.vision}
              spaceNameId={entities.space?.nameID}
              displayName={entities.space?.profile.displayName}
              tagline={entities.space?.profile.tagline}
              description={entities.space?.profile.description}
              dashboardNavigation={dashboardNavigation}
              dashboardNavigationLoading={dashboardNavigationLoading}
              who={entities.space?.context?.who}
              impact={entities.space?.context?.impact}
              spaceVisibility={entities.space?.visibility}
              metrics={entities.space?.metrics}
              loading={state.loading}
              communityId={entities.space?.community?.id}
              communityReadAccess={entities.permissions.communityReadAccess}
              timelineReadAccess={entities.permissions.timelineReadAccess}
              entityReadAccess={entities.permissions.spaceReadAccess}
              readUsersAccess={entities.permissions.readUsers}
              references={entities.references}
              leadUsers={entities.space?.community?.leadUsers}
              hostOrganizations={entities.hostOrganizations}
              leadOrganizations={entities.space?.community?.leadOrganizations}
              activities={entities.activities}
              activityLoading={entities.activityLoading}
              callouts={callouts}
              topCallouts={entities.topCallouts}
              sendMessageToCommunityLeads={entities.sendMessageToCommunityLeads}
              journeyTypeName="space"
            />
            <CommunityUpdatesDialog
              open={dialog === 'updates'}
              onClose={backToDashboard}
              spaceId={entities.space?.id}
              communityId={entities.space?.community?.id}
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
                spaceNameId={entities.space?.nameID}
              />
            )}
          </>
        )}
      </SpaceDashboardContainer>
    </SpacePageLayout>
  );
};

export default SpaceDashboardPage;
