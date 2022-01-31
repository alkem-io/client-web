import React, { FC, useMemo } from 'react';
import { PageProps } from '../../common';
import { useUpdateNavigation } from '../../../hooks';
import { ChallengeContextView } from '../../../views/Challenge/ChallengeContextView';
import {
  ChallengeContainerEntities,
  ChallengeContainerState,
} from '../../../containers/challenge/ChallengePageContainer';

export interface ChallengeDashboardPageProps extends PageProps {
  entities: ChallengeContainerEntities;
  state: ChallengeContainerState;
}

const ChallengeDashboardPage: FC<ChallengeDashboardPageProps> = ({ paths, entities, state }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/dashboard', name: 'dashboard', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return <ChallengeContextView entities={entities} state={state} />;
};
export default ChallengeDashboardPage;
