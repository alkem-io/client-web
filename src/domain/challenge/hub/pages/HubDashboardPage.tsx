import React, { FC } from 'react';
import { useResolvedPath } from 'react-router-dom';
import HubPageContainer from '../containers/HubPageContainer';
import CommunityUpdatesDialog from '../../../community/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import ContributorsDialog from '../../../community/community/ContributorsDialog/ContributorsDialog';
import HubContributorsDialogContent from '../../../community/community/entities/HubContributorsDialogContent';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';
import HubPageLayout from '../layout/HubPageLayout';
import JourneyDashboardView from '../../common/tabs/Dashboard/JourneyDashboardView';
import ChallengeCard from '../../challenge/ChallengeCard/ChallengeCard';
import { useTranslation } from 'react-i18next';
import { getVisualBannerNarrow } from '../../../common/visual/utils/visuals.utils';
import { buildChallengeUrl, buildHubUrl } from '../../../../common/utils/urlBuilders';

export interface HubDashboardPageProps {
  dialog?: 'updates' | 'contributors';
}

const HubDashboardPage: FC<HubDashboardPageProps> = ({ dialog }) => {
  const currentPath = useResolvedPath('..');

  const [backToDashboard] = useBackToParentPage(`${currentPath.pathname}/dashboard`);

  const { t } = useTranslation();

  return (
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
              recommendations={entities.recommendations}
              memberUsers={entities.memberUsers}
              memberUsersCount={entities.memberUsersCount}
              memberOrganizations={entities.memberOrganizations}
              memberOrganizationsCount={entities.memberOrganizationsCount}
              leadUsers={entities.hub?.community?.leadUsers}
              leadOrganizations={entities.hostOrganizations}
              activities={entities.activities}
              activityLoading={entities.activityLoading}
              topCallouts={entities.topCallouts}
              renderChildEntityCard={challenge => (
                <ChallengeCard
                  challengeId={challenge.id}
                  challengeNameId={challenge.nameID}
                  bannerUri={getVisualBannerNarrow(challenge.context?.visuals)}
                  displayName={challenge.displayName}
                  tags={challenge.tagset?.tags!}
                  tagline={challenge.context?.tagline!}
                  vision={challenge.context?.vision!}
                  innovationFlowState={challenge.lifecycle?.state}
                  journeyUri={buildChallengeUrl(entities.hub!.nameID, challenge.nameID)}
                  hubDisplayName={entities.hub!.displayName}
                  hubUri={buildHubUrl(entities.hub!.nameID)}
                />
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
  );
};

export default HubDashboardPage;
