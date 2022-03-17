import React, { FC, useMemo } from 'react';
import ContributeView from '../../views/ContributeView/ContributeView';
import { PageProps } from '../common';
import { useOpportunity, useUpdateNavigation } from '../../hooks';
import ContextTabContainer from '../../containers/context/ContextTabContainer';
import { AuthorizationPrivilege } from '../../models/graphql-schema';

const OpportunityContributePage: FC<PageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/contribute', name: 'contribute', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  const {
    hubNameId,
    opportunityNameId,
    permissions: { contextPrivileges },
  } = useOpportunity();
  const loadAspectsAndReferences = contextPrivileges.includes(AuthorizationPrivilege.Read);

  return (
    <ContextTabContainer
      hubNameId={hubNameId}
      opportunityNameId={opportunityNameId}
      loadAspectsAndReferences={loadAspectsAndReferences}
    >
      {(entities, state) => (
        <ContributeView
          entities={{
            context: entities.context,
            aspects: entities?.aspects,
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

export default OpportunityContributePage;
