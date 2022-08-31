import React, { FC, useMemo } from 'react';
import { ChallengeExplorerContainer } from '../../../containers/challenge/ChallengeExplorerContainer';
import { useUpdateNavigation } from '../../../hooks';
import { ChallengeExplorerView } from '../views/ChallengeExplorerView';

export interface ChallengeExplorerPageProps {}

export const ChallengeExplorerPage: FC<ChallengeExplorerPageProps> = () => {
  const currentPaths = useMemo(() => [{ value: '/', name: 'challenges', real: true }], []);
  useUpdateNavigation({ currentPaths });

  return (
    <ChallengeExplorerContainer>
      {(entities, state) => {
        if (!entities || !state) return null;

        return <ChallengeExplorerView myChallenges={entities.userChallenges} hubs={entities.userHubs} />;
      }}
    </ChallengeExplorerContainer>
  );
};
