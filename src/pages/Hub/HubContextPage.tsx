import React, { FC, useMemo } from 'react';
import { PageProps } from '../common';
import { useEcoverse, useUpdateNavigation } from '../../hooks';
import EcoverseContextView from '../../views/Ecoverse/EcoverseContextView';
import ContextTabContainer from '../../containers/context/ContextTabContainer';
import { AuthorizationPrivilege } from '../../models/graphql-schema';

export interface EcoverseContextPageProps extends PageProps {}

const EcoverseContextPage: FC<EcoverseContextPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/context', name: 'context', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  const {
    hubId,
    hubNameId,
    displayName,
    permissions: { contextPrivileges },
  } = useEcoverse();
  const loadAspectsAndReferences = contextPrivileges.includes(AuthorizationPrivilege.Read);

  return (
    <ContextTabContainer hubNameId={hubNameId} loadAspectsAndReferences={loadAspectsAndReferences}>
      {(entities, state) => (
        <EcoverseContextView
          entities={{
            hubId: hubId,
            hubNameId: hubNameId,
            hubDisplayName: displayName,
            hubTagSet: entities.tagset,
            context: entities.context,
            aspects: entities?.aspects,
            references: entities?.references,
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
export default EcoverseContextPage;
