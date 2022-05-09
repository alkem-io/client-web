import React, { FC } from 'react';
import { useResolvedPath } from 'react-router-dom';
import ChallengePageContainer from '../../../containers/challenge/ChallengePageContainer';
import { DiscussionsProvider } from '../../../context/Discussions/DiscussionsProvider';
import ChallengePageLayout from '../layout/ChallengePageLayout';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import useBackToParentPage from '../../shared/utils/useBackToParentPage';
import CommunityUpdatesDialog from '../../community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import ContributorsDialog from '../../community/ContributorsDialog/ContributorsDialog';
import ChallengeContributorsDialogContent from '../../community/entities/ChallengeContributorsDialogContent';
import { ChallengeDashboardView } from '../views/ChallengeDashboardView';

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
