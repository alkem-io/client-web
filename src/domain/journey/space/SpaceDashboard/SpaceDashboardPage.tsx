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
import JourneyAboutDialog from '../../common/JourneyAboutDialog/JourneyAboutDialog';
import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { buildUpdatesUrl } from '../../../../main/routing/urlBuilders';

export interface SpaceDashboardPageProps {
  dialog?: 'about' | 'updates' | 'contributors' | 'calendar';
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

  const shareUpdatesUrl = buildUpdatesUrl({ spaceNameId });

  return (
    <SpacePageLayout currentSection={EntityPageSection.Dashboard}>
      <SpaceDashboardContainer>
        {({ callouts, ...entities }, state) => (
          <>
            <SpaceDashboardView
              vision={entities.space?.context?.vision}
              spaceNameId={entities.space?.nameID}
              displayName={entities.space?.profile.displayName}
              dashboardNavigation={dashboardNavigation}
              dashboardNavigationLoading={dashboardNavigationLoading}
              spaceVisibility={entities.space?.visibility}
              loading={state.loading}
              communityId={entities.space?.community?.id}
              communityReadAccess={entities.permissions.communityReadAccess}
              timelineReadAccess={entities.permissions.timelineReadAccess}
              entityReadAccess={entities.permissions.spaceReadAccess}
              readUsersAccess={entities.permissions.readUsers}
              leadUsers={entities.space?.community?.leadUsers}
              leadOrganizations={entities.space?.community?.leadOrganizations}
              activities={entities.activities}
              fetchMoreActivities={entities.fetchMoreActivities}
              activityLoading={entities.activityLoading}
              callouts={callouts}
              topCallouts={entities.topCallouts}
              journeyTypeName="space"
              shareUpdatesUrl={shareUpdatesUrl}
            />
            <CommunityUpdatesDialog
              open={dialog === 'updates'}
              onClose={backToDashboard}
              spaceId={entities.space?.id}
              communityId={entities.space?.community?.id}
              shareUrl={shareUpdatesUrl}
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
            <JourneyAboutDialog
              open={dialog === 'about'}
              journeyTypeName="space"
              displayName={entities.space?.profile.displayName}
              tagline={entities.space?.profile.tagline}
              references={entities.references}
              sendMessageToCommunityLeads={entities.sendMessageToCommunityLeads}
              metrics={entities.space?.metrics}
              description={entities.space?.context?.vision}
              background={entities.space?.profile.description}
              who={entities.space?.context?.who}
              impact={entities.space?.context?.impact}
              loading={state.loading}
              leadUsers={entities.space?.community?.leadUsers}
              hostOrganizations={entities.hostOrganizations}
              leadOrganizations={entities.space?.community?.leadOrganizations}
              endButton={
                <IconButton onClick={backToDashboard}>
                  <Close />
                </IconButton>
              }
            />
          </>
        )}
      </SpaceDashboardContainer>
    </SpacePageLayout>
  );
};

export default SpaceDashboardPage;
