import React, { FC } from 'react';
import HubPageContainer from '../../containers/hub/HubPageContainer';
import HubDashboardView from '../../views/Hub/HubDashboardView';
import { DiscussionsProvider } from '../../context/Discussions/DiscussionsProvider';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';
import HubPageLayout from '../../domain/hub/layout/HubPageLayout';
import CommunityUpdatesDialog from '../../domain/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import useBackToParentPage from '../../domain/shared/utils/useBackToParentPage';
import { useResolvedPath } from 'react-router-dom';
import ContributorsDialog from '../../domain/community/ContributorsDialog/ContributorsDialog';
import HubContributorsDialogContent from '../../domain/community/entities/HubContributorsDialogContent';

export interface HubDashboardPageProps {
  dialog?: 'updates' | 'contributors';
}

const HubDashboardPage: FC<HubDashboardPageProps> = ({ dialog }) => {
  const currentPath = useResolvedPath('..');

  const [backToDashboard] = useBackToParentPage(`${currentPath.pathname}/dashboard`);

  return (
    <DiscussionsProvider>
      <HubPageLayout currentSection={EntityPageSection.Dashboard}>
        <HubPageContainer>
          {(entities, state) => (
            <>
              <HubDashboardView
                vision={entities.hub?.context?.vision}
                hubId={entities.hub?.id}
                hubNameId={entities.hub?.nameID}
                communityId={entities.hub?.community?.id}
                organizationNameId={entities.hub?.host?.nameID}
                challenges={entities.challenges}
                challengesCount={entities.challengesCount}
                discussions={entities.discussionList}
                aspects={entities.aspects}
                aspectsCount={entities.aspectsCount}
                canvases={entities.canvases}
                canvasesCount={entities.canvasesCount}
                loading={state.loading}
                isMember={entities.isMember}
                communityReadAccess={entities.permissions.communityReadAccess}
                challengesReadAccess={entities.permissions.challengesReadAccess}
                memberUsers={entities.memberUsers}
                memberUsersCount={entities.memberUsersCount}
                memberOrganizations={entities.memberOrganizations}
                memberOrganizationsCount={entities.memberOrganizationsCount}
                leadUsers={entities.hub?.community?.leadUsers}
                hostOrganization={entities.hub?.host}
              />
              <CommunityUpdatesDialog
                open={dialog === 'updates'}
                onClose={backToDashboard}
                hubId={entities.hub?.id}
                communityId={entities.hub?.community?.id}
              />
              <ContributorsDialog
                open={dialog === 'contributors'}
                onClose={backToDashboard}
                dialogContent={HubContributorsDialogContent}
              />
            </>
          )}
        </HubPageContainer>
      </HubPageLayout>
    </DiscussionsProvider>
  );
};
export default HubDashboardPage;
