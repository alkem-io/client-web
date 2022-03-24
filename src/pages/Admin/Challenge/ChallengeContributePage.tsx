import React, { FC, useMemo } from 'react';
import { PageProps } from '../../common';
import { useChallenge, useUpdateNavigation } from '../../../hooks';
import ContributeView from '../../../views/ContributeView/ContributeView';
import ContextTabContainer from '../../../containers/context/ContextTabContainer';
import { AuthorizationPrivilege } from '../../../models/graphql-schema';

const ChallengeContributePage: FC<PageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/contribute', name: 'contribute', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  const {
    hubNameId,
    challengeNameId,
    permissions: { contextPrivileges },
  } = useChallenge();
  const loadAspectsAndReferences = contextPrivileges.includes(AuthorizationPrivilege.Read);

  return (
    <ContextTabContainer
      hubNameId={hubNameId}
      challengeNameId={challengeNameId}
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

export default ChallengeContributePage;
