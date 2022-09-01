import React, { FC } from 'react';
import { useResolvedPath } from 'react-router-dom';
import HubPageContainer from '../../../containers/hub/HubPageContainer';
import { DiscussionsProvider } from '../../../context/Discussions/DiscussionsProvider';
import CommunityUpdatesDialog from '../../community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import ContributorsDialog from '../../community/ContributorsDialog/ContributorsDialog';
import HubContributorsDialogContent from '../../community/entities/HubContributorsDialogContent';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import useBackToParentPage from '../../shared/utils/useBackToParentPage';
import HubPageLayout from '../layout/HubPageLayout';
import HubDashboardView from '../views/HubDashboardView';

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
                references={entities.references}
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
