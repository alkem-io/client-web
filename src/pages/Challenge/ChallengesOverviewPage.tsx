import React, { FC, useMemo } from 'react';
import { useUpdateNavigation } from '../../hooks';
import { ChallengesOverviewPageContainer } from '../../containers/challenge/ChallengesOverviewPageContainer';
import { ChallengesOverviewView } from '../../views/Challenge/ChallengesOverviewView';

export interface ChallengesOverviewPageProps {}

export const ChallengesOverviewPage: FC<ChallengesOverviewPageProps> = () => {
  const currentPaths = useMemo(() => [{ value: '/', name: 'challenges', real: true }], []);
  useUpdateNavigation({ currentPaths });

  return (
    <ChallengesOverviewPageContainer>
      {(entities, state) => {
        if (!entities || !state) return null;

        return <ChallengesOverviewView my={entities.userChallenges} hubs={entities.userHubs} />;
      }}
    </ChallengesOverviewPageContainer>
  );
};
