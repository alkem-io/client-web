import React, { FC } from 'react';
import { OpportunityPageContainer } from '../../containers';
import OpportunityDashboardView from '../../views/Opportunity/OpportunityDashboardView';
import { DiscussionsProvider } from '../../context/Discussions/DiscussionsProvider';
import OpportunityPageLayout from '../../domain/opportunity/layout/OpportunityPageLayout';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';
import useBackToParentPage from '../../domain/shared/utils/useBackToParentPage';
import CommunityUpdatesDialog from '../../domain/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import { useResolvedPath } from 'react-router-dom';
import ContributorsDialog from '../../domain/community/ContributorsDialog/ContributorsDialog';
import OpportunityContributorsDialogContent from '../../domain/community/entities/OpportunityContributorsDialogContent';

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
