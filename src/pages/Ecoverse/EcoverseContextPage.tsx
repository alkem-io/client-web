import React, { FC, useMemo } from 'react';
import { PageProps } from '../common';
import { EcoverseContainerEntities, EcoverseContainerState } from '../../containers/ecoverse/EcoversePageContainer';
import { useUpdateNavigation } from '../../hooks';
import EcoverseContextView from '../../views/Ecoverse/EcoverseContextView';

export interface EcoverseContextPageProps extends PageProps {
  entities: EcoverseContainerEntities;
  state: EcoverseContainerState;
}

const EcoverseContextPage: FC<EcoverseContextPageProps> = ({ paths, entities, state }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/context', name: 'context', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return <EcoverseContextView entities={entities} state={state} />;
};
export default EcoverseContextPage;
