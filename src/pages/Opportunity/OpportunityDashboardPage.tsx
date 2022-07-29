import React, { FC, useMemo } from 'react';
import { OpportunityPageContainer } from '../../containers';
import OpportunityDashboardView from '../../views/Opportunity/OpportunityDashboardView';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';
import { DiscussionsProvider } from '../../context/Discussions/DiscussionsProvider';
import PageLayout from '../../domain/shared/layout/PageLayout';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';
import useBackToParentPage from '../../domain/shared/utils/useBackToParentPage';
import CommunityUpdatesDialog from '../../domain/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import { useLastPathUrl } from '../../hooks/usePathUtils';

export interface OpportunityDashboardPageProps extends PageProps {
  dialog?: 'updates'; // | ... Pending, add more dialogs here.
}

const OpportunityDashboardPage: FC<OpportunityDashboardPageProps> = ({ paths, dialog }) => {
  const opportunityUrl = useLastPathUrl(paths);
  const currentPaths = useMemo(() => [...paths, { value: '/dashboard', name: 'dashboard', real: true }], [paths]);
  useUpdateNavigation({ currentPaths });

  const [backToDashboard] = useBackToParentPage(`${opportunityUrl + '/dashboard'}`);

  return (
    <PageLayout currentSection={EntityPageSection.Dashboard} entityTypeName="opportunity">
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
            </>
          )}
        </OpportunityPageContainer>
      </DiscussionsProvider>
    </PageLayout>
  );
};
export default OpportunityDashboardPage;
