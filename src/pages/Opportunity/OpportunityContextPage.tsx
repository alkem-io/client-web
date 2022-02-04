import React, { FC, useMemo } from 'react';
import OpportunityContextView from '../../views/Opportunity/OpportunityContextView';
import { PageProps } from '../common';
import { useOpportunity, useUpdateNavigation } from '../../hooks';
import ContextTabContainer from '../../containers/context/ContextTabContainer';

export interface OpportunityContextPageProps extends PageProps {}

const OpportunityContextPage: FC<OpportunityContextPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/context', name: 'context', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  const { ecoverseNameId, opportunityNameId, displayName } = useOpportunity();

  return (
    <ContextTabContainer hubNameId={ecoverseNameId} opportunityNameId={opportunityNameId}>
      {(entities, state) => (
        <OpportunityContextView
          entities={{
            opportunityDisplayName: displayName,
            opportunityTagset: entities.tagset,
            opportunityLifecycle: entities.lifecycle,
            context: entities.context,
          }}
          state={{
            loading: state.loading,
            error: state.error,
          }}
          options={{
            canReadAspects: entities.permissions.canReadAspects,
            canCreateAspects: entities.permissions.canCreateAspects,
          }}
          actions={{}}
        />
      )}
    </ContextTabContainer>
  );
};
export default OpportunityContextPage;
