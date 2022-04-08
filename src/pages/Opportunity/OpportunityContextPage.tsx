import React, { FC, useMemo } from 'react';
import OpportunityContextView from '../../views/Opportunity/OpportunityContextView';
import { PageProps } from '../common';
import { useOpportunity, useUpdateNavigation } from '../../hooks';
import ContextTabContainer from '../../containers/context/ContextTabContainer';
import { AuthorizationPrivilege } from '../../models/graphql-schema';

export interface OpportunityContextPageProps extends PageProps {}

const OpportunityContextPage: FC<OpportunityContextPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/context', name: 'context', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  const {
    hubNameId,
    opportunityNameId,
    displayName,
    permissions: { contextPrivileges },
  } = useOpportunity();
  const loadAspectsAndReferences = contextPrivileges.includes(AuthorizationPrivilege.Read);

  return (
    <ContextTabContainer
      hubNameId={hubNameId}
      opportunityNameId={opportunityNameId}
      loadReferences={loadAspectsAndReferences}
    >
      {(entities, state) => (
        <OpportunityContextView
          entities={{
            opportunityDisplayName: displayName,
            opportunityTagset: entities.tagset,
            opportunityLifecycle: entities.lifecycle,
            context: entities.context,
            references: entities?.references,
          }}
          state={{
            loading: state.loading,
            error: state.error,
          }}
          options={{}}
          actions={{}}
        />
      )}
    </ContextTabContainer>
  );
};
export default OpportunityContextPage;
