import React, { FC, useMemo } from 'react';
import { OpportunityContainerActions, OpportunityContainerEntities, OpportunityContainerState } from '../../containers';
import OpportunityDashboardView from '../../views/Opportunity/OpportunityDashboardView';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';

export interface OpportunityDashboardPageProps extends PageProps {
  entities: OpportunityContainerEntities;
  state: OpportunityContainerState;
  actions: OpportunityContainerActions;
}

const OpportunityDashboardPage: FC<OpportunityDashboardPageProps> = ({ paths, entities, state, actions }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/dashboard', name: 'dashboard', real: true }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
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
  );
};
export default OpportunityDashboardPage;
