import React, { FC, useMemo } from 'react';
import { PageProps } from '../common';
import { useEcoverse, useUpdateNavigation } from '../../hooks';
import EcoverseContextView from '../../views/Ecoverse/EcoverseContextView';
import ContextTabContainer from '../../containers/context/ContextTabContainer';

export interface EcoverseContextPageProps extends PageProps {}

const EcoverseContextPage: FC<EcoverseContextPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/context', name: 'context', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  const { ecoverseId, ecoverseNameId, displayName } = useEcoverse();

  return (
    <ContextTabContainer hubNameId={ecoverseNameId}>
      {(entities, state) => (
        <EcoverseContextView
          entities={{
            hubId: ecoverseId,
            hubNameId: ecoverseNameId,
            hubDisplayName: displayName,
            hubTagSet: entities.tagset,
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
export default EcoverseContextPage;
