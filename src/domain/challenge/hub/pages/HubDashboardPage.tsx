import React, { FC } from 'react';
import { useResolvedPath } from 'react-router-dom';
import HubPageContainer from '../containers/HubPageContainer';
import { DiscussionsProvider } from '../../../communication/discussion/providers/DiscussionsProvider';
import CommunityUpdatesDialog from '../../../community/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import ContributorsDialog from '../../../community/community/ContributorsDialog/ContributorsDialog';
import HubContributorsDialogContent from '../../../community/community/entities/HubContributorsDialogContent';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';
import HubPageLayout from '../layout/HubPageLayout';
import JourneyDashboardView from '../../common/tabs/Dashboard/JourneyDashboardView';
import ChallengeCard from '../../../../common/components/composite/common/cards/ChallengeCard/ChallengeCard';
import { useTranslation } from 'react-i18next';

export interface HubDashboardPageProps {
  dialog?: 'updates' | 'contributors';
}

const HubDashboardPage: FC<HubDashboardPageProps> = ({ dialog }) => {
  const currentPath = useResolvedPath('..');

  const [backToDashboard] = useBackToParentPage(`${currentPath.pathname}/dashboard`);

  const { t } = useTranslation();

  return (
    <DiscussionsProvider>
      <HubPageLayout currentSection={EntityPageSection.Dashboard}>
        <HubPageContainer>
          {entities => (
            <>
              <JourneyDashboardView
                vision={entities.hub?.context?.vision}
                hubNameId={entities.hub?.nameID}
                communityId={entities.hub?.community?.id}
                childEntities={entities.challenges}
                childEntitiesCount={entities.challengesCount}
                communityReadAccess={entities.permissions.communityReadAccess}
                childEntityReadAccess={entities.permissions.challengesReadAccess}
                references={entities.references}
                memberUsers={entities.memberUsers}
                memberUsersCount={entities.memberUsersCount}
                memberOrganizations={entities.memberOrganizations}
                memberOrganizationsCount={entities.memberOrganizationsCount}
                leadUsers={entities.hub?.community?.leadUsers}
                leadOrganizations={entities.hostOrganizations}
                activities={entities.activities}
                activityLoading={entities.activityLoading}
                renderChildEntityCard={challenge => (
                  <ChallengeCard challenge={challenge} hubNameId={entities.hub?.nameID} />
                )}
                journeyTypeName="hub"
                childEntityTitle={t('common.challenges')}
              />
              <CommunityUpdatesDialog
                open={dialog === 'updates'}
                onClose={backToDashboard}
                hubId={entities.hub?.id}
                communityId={entities.hub?.community?.id}
              />
              <ContributorsDialog
                open={dialog === 'contributors'}
                onClose={backToDashboard}
                dialogContent={HubContributorsDialogContent}
              />
            </>
          )}
        </HubPageContainer>
      </HubPageLayout>
    </DiscussionsProvider>
  );
};

export default HubDashboardPage;
