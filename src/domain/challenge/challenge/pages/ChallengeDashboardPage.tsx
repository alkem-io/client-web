import React, { FC } from 'react';
import { useResolvedPath } from 'react-router-dom';
import ChallengePageContainer from '../containers/ChallengePageContainer';
import { DiscussionsProvider } from '../../../communication/discussion/providers/DiscussionsProvider';
import ChallengePageLayout from '../layout/ChallengePageLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';
import CommunityUpdatesDialog from '../../../community/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import ContributorsDialog from '../../../community/community/ContributorsDialog/ContributorsDialog';
import ChallengeContributorsDialogContent from '../../../community/community/entities/ChallengeContributorsDialogContent';
import JourneyDashboardView from '../../common/tabs/Dashboard/JourneyDashboardView';
import OpportunityCard from '../../../../common/components/composite/common/cards/OpportunityCard/OpportunityCard';
import { useTranslation } from 'react-i18next';

export interface ChallengeDashboardPageProps {
  dialog?: 'updates' | 'contributors';
}

const ChallengeDashboardPage: FC<ChallengeDashboardPageProps> = ({ dialog }) => {
  const currentPath = useResolvedPath('..');

  const [backToDashboard] = useBackToParentPage(`${currentPath.pathname}/dashboard`);

  const { t } = useTranslation();

  return (
    <ChallengePageLayout currentSection={EntityPageSection.Dashboard}>
      <DiscussionsProvider>
        <ChallengePageContainer>
          {(entities, state) => (
            <>
              <JourneyDashboardView
                vision={entities.challenge?.context?.vision}
                hubNameId={entities.hubNameId}
                communityId={entities.challenge?.community?.id}
                childEntities={entities.challenge?.opportunities}
                childEntitiesCount={entities.opportunitiesCount}
                communityReadAccess={entities.permissions.communityReadAccess}
                childEntityReadAccess
                references={entities.references}
                memberUsers={entities.memberUsers}
                memberUsersCount={entities.memberUsersCount}
                memberOrganizations={entities.memberOrganizations}
                memberOrganizationsCount={entities.memberOrganizationsCount}
                leadUsers={entities.challenge?.community?.leadUsers}
                leadOrganizations={entities.challenge?.community?.leadOrganizations}
                activities={entities.activities}
                activityLoading={state.activityLoading}
                renderChildEntityCard={opportunity => (
                  <OpportunityCard
                    opportunity={opportunity}
                    hubNameId={entities.hubNameId}
                    challengeNameId={entities.challenge!.nameID}
                  />
                )}
                journeyTypeName="challenge"
                childEntityTitle={t('pages.challenge.sections.dashboard.opportunities.title')}
              />
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
