import React, { FC, useMemo } from 'react';
import { PageProps } from '../../common';
import { useUpdateNavigation } from '../../../hooks';
import ChallengePageContainer from '../../../containers/challenge/ChallengePageContainer';
import { ChallengeDashboardView } from '../../../views/Challenge/ChallengeDashboardView';
import { DiscussionsProvider } from '../../../context/Discussions/DiscussionsProvider';
import PageLayout from '../../../domain/shared/layout/PageLayout';
import { EntityPageSection } from '../../../domain/shared/layout/EntityPageSection';
import { useLastPathUrl } from '../../../hooks/usePathUtils';
import useBackToParentPage from '../../../domain/shared/utils/useBackToParentPage';
import CommunityUpdatesDialog from '../../../domain/community/CommunityUpdatesDialog/CommunityUpdatesDialog';

export interface ChallengeDashboardPageProps extends PageProps {
  dialog?: 'updates'; // | ... Pending, add more dialogs here.
}

const ChallengeDashboardPage: FC<ChallengeDashboardPageProps> = ({ paths, dialog }) => {
  const challengeUrl = useLastPathUrl(paths);
  const currentPaths = useMemo(() => [...paths, { value: '/dashboard', name: 'dashboard', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });
  const [backToDashboard] = useBackToParentPage(`${challengeUrl + '/dashboard'}`);

  return (
    <PageLayout currentSection={EntityPageSection.Dashboard} entityTypeName="challenge">
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
            </>
          )}
        </ChallengePageContainer>
      </DiscussionsProvider>
    </PageLayout>
  );
};

export default ChallengeDashboardPage;
