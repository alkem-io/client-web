import React, { FC } from 'react';
import { useResolvedPath } from 'react-router-dom';
import { OpportunityPageContainer } from '../../../containers';
import { DiscussionsProvider } from '../../../context/Discussions/DiscussionsProvider';
import CommunityUpdatesDialog from '../../community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import ContributorsDialog from '../../community/ContributorsDialog/ContributorsDialog';
import OpportunityContributorsDialogContent from '../../community/entities/OpportunityContributorsDialogContent';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import useBackToParentPage from '../../shared/utils/useBackToParentPage';
import OpportunityPageLayout from '../layout/OpportunityPageLayout';
import OpportunityDashboardView from '../views/OpportunityDashboardView';

export interface OpportunityDashboardPageProps {
  dialog?: 'updates' | 'contributors';
}

const OpportunityDashboardPage: FC<OpportunityDashboardPageProps> = ({ dialog }) => {
  const currentPath = useResolvedPath('..');

  const [backToDashboard] = useBackToParentPage(`${currentPath.pathname}/dashboard`);

  return (
    <OpportunityPageLayout currentSection={EntityPageSection.Dashboard}>
      <DiscussionsProvider>
        <OpportunityPageContainer>
          {(entities, state, actions) => (
            <>
              <OpportunityDashboardView
                entities={entities}
                state={{
                  loading: state.loading,
                  showInterestModal: entities.showInterestModal,
                  showActorGroupModal: entities.showActorGroupModal,
                  error: state.error,
                }}
                actions={actions}
                options={entities.permissions}
              />
              <CommunityUpdatesDialog
                open={dialog === 'updates'}
                onClose={backToDashboard}
                hubId={entities.hubId}
                communityId={entities.opportunity?.community?.id}
              />
              <ContributorsDialog
                open={dialog === 'contributors'}
                onClose={backToDashboard}
                dialogContent={OpportunityContributorsDialogContent}
              />
            </>
          )}
        </OpportunityPageContainer>
      </DiscussionsProvider>
    </OpportunityPageLayout>
  );
};
export default OpportunityDashboardPage;
