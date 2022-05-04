import React, { FC, useMemo } from 'react';
import { PageProps } from '../../common';
import { useUpdateNavigation } from '../../../hooks';
import ChallengePageContainer from '../../../containers/challenge/ChallengePageContainer';
import { ChallengeDashboardView } from '../../../views/Challenge/ChallengeDashboardView';
import { DiscussionsProvider } from '../../../context/Discussions/DiscussionsProvider';
import PageLayout from '../../../domain/shared/layout/PageLayout';
import { EntityPageSection } from '../../../domain/shared/layout/EntityPageSection';

export interface ChallengeDashboardPageProps extends PageProps {}

const ChallengeDashboardPage: FC<ChallengeDashboardPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/dashboard', name: 'dashboard', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <PageLayout currentSection={EntityPageSection.Dashboard} entityTypeName="challenge">
      <DiscussionsProvider>
        <ChallengePageContainer>
          {(entities, state) => <ChallengeDashboardView entities={entities} state={state} />}
        </ChallengePageContainer>
      </DiscussionsProvider>
    </PageLayout>
  );
};

export default ChallengeDashboardPage;
