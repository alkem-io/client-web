import React, { FC } from 'react';
import { useResolvedPath } from 'react-router-dom';
import ChallengePageContainer from '../../containers/challenge/ChallengePageContainer';
import { ChallengeDashboardView } from '../../views/Challenge/ChallengeDashboardView';
import { DiscussionsProvider } from '../../context/Discussions/DiscussionsProvider';
import ChallengePageLayout from '../../domain/challenge/layout/ChallengePageLayout';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';
import useBackToParentPage from '../../domain/shared/utils/useBackToParentPage';
import CommunityUpdatesDialog from '../../domain/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import ContributorsDialog from '../../domain/community/ContributorsDialog/ContributorsDialog';
import ChallengeContributorsDialogContent from '../../domain/community/entities/ChallengeContributorsDialogContent';

export interface ChallengeDashboardPageProps {
  dialog?: 'updates' | 'contributors';
}

const ChallengeDashboardPage: FC<ChallengeDashboardPageProps> = ({ dialog }) => {
  const currentPath = useResolvedPath('..');

  const [backToDashboard] = useBackToParentPage(`${currentPath.pathname}/dashboard`);

  return (
    <ChallengePageLayout currentSection={EntityPageSection.Dashboard}>
      <DiscussionsProvider>
        <ChallengePageContainer>
          {(entities, state) => (
            <>
              <ChallengeDashboardView entities={entities} state={state} />
              <CommunityUpdatesDialog
                open={dialog === 'updates'}
                onClose={backToDashboard}
                hubId={entities.hubId}
                communityId={entities.challenge?.community?.id}
              />
              <ContributorsDialog
                open={dialog === 'contributors'}
                onClose={backToDashboard}
                dialogContent={ChallengeContributorsDialogContent}
              />
            </>
          )}
        </ChallengePageContainer>
      </DiscussionsProvider>
    </ChallengePageLayout>
  );
};

export default ChallengeDashboardPage;
