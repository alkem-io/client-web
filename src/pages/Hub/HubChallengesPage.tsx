import React, { FC, useMemo } from 'react';
import { useUpdateNavigation } from '../../hooks';
import { PageProps } from '../common';
import { EcoverseContainerEntities, EcoverseContainerState } from '../../containers/hub/EcoversePageContainer';
import EcoverseChallengesView from '../../views/Ecoverse/EcoverseChallengesView';

export interface HubChallengesPageProps extends PageProps {
  entities: EcoverseContainerEntities;
  state: EcoverseContainerState;
}

const HubChallengesPage: FC<HubChallengesPageProps> = ({ paths, entities, state }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/challenges', name: 'challenges', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return <EcoverseChallengesView entities={entities} state={state} />;
};
export default HubChallengesPage;
