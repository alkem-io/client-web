import React, { FC, useMemo } from 'react';
import { useUpdateNavigation } from '../../hooks';
import { PageProps } from '../common';
import { HubContainerEntities, HubContainerState } from '../../containers/hub/HubPageContainer';
import HubChallengesView from '../../views/Hub/HubChallengesView';

export interface HubChallengesPageProps extends PageProps {
  entities: HubContainerEntities;
  state: HubContainerState;
}

const HubChallengesPage: FC<HubChallengesPageProps> = ({ paths, entities, state }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/challenges', name: 'challenges', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return <HubChallengesView entities={entities} state={state} />;
};
export default HubChallengesPage;
