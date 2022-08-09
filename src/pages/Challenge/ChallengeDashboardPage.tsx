import React, { FC, useMemo } from 'react';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';
import ChallengePageContainer from '../../containers/challenge/ChallengePageContainer';
import { ChallengeDashboardView } from '../../views/Challenge/ChallengeDashboardView';
import { DiscussionsProvider } from '../../context/Discussions/DiscussionsProvider';
import ChallengePageLayout from '../../domain/challenge/layout/ChallengePageLayout';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';

export interface ChallengeDashboardPageProps extends PageProps {}

const ChallengeDashboardPage: FC<ChallengeDashboardPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/dashboard', name: 'dashboard', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <ChallengePageLayout currentSection={EntityPageSection.Dashboard}>
      <DiscussionsProvider>
        <ChallengePageContainer>
          {(entities, state) => <ChallengeDashboardView entities={entities} state={state} />}
        </ChallengePageContainer>
      </DiscussionsProvider>
    </ChallengePageLayout>
  );
};

export default ChallengeDashboardPage;
