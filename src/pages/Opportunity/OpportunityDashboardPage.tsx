import React, { FC, useMemo } from 'react';
import { OpportunityPageContainer } from '../../containers';
import OpportunityDashboardView from '../../views/Opportunity/OpportunityDashboardView';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';
import { DiscussionsProvider } from '../../context/Discussions/DiscussionsProvider';
import OpportunityPageLayout from '../../domain/opportunity/layout/OpportunityPageLayout';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';

export interface OpportunityDashboardPageProps extends PageProps {}

const OpportunityDashboardPage: FC<OpportunityDashboardPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/dashboard', name: 'dashboard', real: true }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <OpportunityPageLayout currentSection={EntityPageSection.Dashboard} entityTypeName="opportunity">
      <DiscussionsProvider>
        <OpportunityPageContainer>
          {(entities, state, actions) => (
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
          )}
        </OpportunityPageContainer>
      </DiscussionsProvider>
    </OpportunityPageLayout>
  );
};
export default OpportunityDashboardPage;
