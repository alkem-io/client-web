import React, { FC, useMemo } from 'react';
import { PageProps } from '../../common';
import { useUpdateNavigation } from '../../../hooks';
import {
  ChallengeContainerEntities,
  ChallengeContainerState,
} from '../../../containers/challenge/ChallengePageContainer';
import { ChallengeDashboardView } from '../../../views/Challenge/ChallengeDashboardView';

export interface ChallengeDashboardPageProps extends PageProps {
  entities: ChallengeContainerEntities;
  state: ChallengeContainerState;
}

const ChallengeDashboardPage: FC<ChallengeDashboardPageProps> = ({ paths, entities, state }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/dashboard', name: 'dashboard', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return <ChallengeDashboardView entities={entities} state={state} />;
};
export default ChallengeDashboardPage;
