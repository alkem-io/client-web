import React, { FC, useMemo } from 'react';
import { PageProps } from '../../common';
import { useUpdateNavigation } from '../../../hooks';
import ChallengePageContainer from '../../../containers/challenge/ChallengePageContainer';
import { ChallengeDashboardView } from '../../../views/Challenge/ChallengeDashboardView';
import { DiscussionProvider } from '../../../context/Discussions/DiscussionProvider';

export interface ChallengeDashboardPageProps extends PageProps {}

const ChallengeDashboardPage: FC<ChallengeDashboardPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/dashboard', name: 'dashboard', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <DiscussionProvider>
      <ChallengePageContainer>
        {(entities, state) => <ChallengeDashboardView entities={entities} state={state} />}
      </ChallengePageContainer>
    </DiscussionProvider>
  );
};
export default ChallengeDashboardPage;
