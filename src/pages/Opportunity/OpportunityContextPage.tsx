import React, { FC, useMemo } from 'react';
import { OpportunityContainerActions, OpportunityContainerEntities, OpportunityContainerState } from '../../containers';
import OpportunityContextView from '../../views/Opportunity/OpportunityContextView';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';

export interface OpportunityContextPageProps extends PageProps {
  entities: OpportunityContainerEntities;
  state: OpportunityContainerState;
  actions: OpportunityContainerActions;
}

const OpportunityContextPage: FC<OpportunityContextPageProps> = ({ paths, entities, state, actions }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/context', name: 'context', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <OpportunityContextView
      entities={entities}
      state={{
        showActorGroupModal: entities.showActorGroupModal,
        loading: state.loading,
        error: state.error,
      }}
      actions={actions}
      options={entities.permissions}
    />
  );
};
export default OpportunityContextPage;
