import React, { FC } from 'react';
import { useResolvedPath } from 'react-router-dom';
import ChallengePageContainer from '../containers/ChallengePageContainer';
import ChallengePageLayout from '../layout/ChallengePageLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';
import CommunityUpdatesDialog from '../../../community/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import ContributorsDialog from '../../../community/community/ContributorsDialog/ContributorsDialog';
import ChallengeContributorsDialogContent from '../../../community/community/entities/ChallengeContributorsDialogContent';
import JourneyDashboardView from '../../common/tabs/Dashboard/JourneyDashboardView';
import OpportunityCard from '../../opportunity/OpportunityCard/OpportunityCard';
import { useTranslation } from 'react-i18next';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { buildChallengeUrl, buildOpportunityUrl } from '../../../../common/utils/urlBuilders';
import { VisualName } from '../../../common/visual/constants/visuals.constants';
import useCallouts from '../../../collaboration/callout/useCallouts/useCallouts';
import { CalloutsGroup } from '../../../collaboration/callout/CalloutsInContext/CalloutsGroup';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import CalloutsGroupView from '../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';
import JourneyDashboardVision from '../../common/tabs/Dashboard/JourneyDashboardVision';
import ApplicationButtonContainer from '../../../community/application/containers/ApplicationButtonContainer';
import ApplicationButton from '../../../../common/components/composite/common/ApplicationButton/ApplicationButton';

export interface ChallengeDashboardPageProps {
  dialog?: 'updates' | 'contributors';
}

const ChallengeDashboardPage: FC<ChallengeDashboardPageProps> = ({ dialog }) => {
  const currentPath = useResolvedPath('..');

  const [backToDashboard] = useBackToParentPage(`${currentPath.pathname}/dashboard`);

  const { t } = useTranslation();

  const { hubNameId, challengeNameId } = useUrlParams();

  const { groupedCallouts, calloutNames, loading, calloutsSortOrder, onCalloutsSortOrderUpdate, refetchCallout } =
    useCallouts({
      hubNameId,
      challengeNameId,
      calloutGroups: [CalloutsGroup.HomeTop],
    });

  return (
    <ChallengePageLayout currentSection={EntityPageSection.Dashboard}>
      <ChallengePageContainer>
        {(entities, state) => (
          <>
            <JourneyDashboardView
              vision={
                <JourneyDashboardVision
                  vision={entities.challenge?.context?.vision}
                  journeyTypeName="challenge"
                  actions={
                    <ApplicationButtonContainer
                      challengeId={entities.challenge?.id}
                      challengeNameId={challengeNameId}
                      challengeName={entities.challenge?.profile.displayName}
                    >
                      {(e, s) => <ApplicationButton {...e?.applicationButtonProps} loading={s.loading} />}
                    </ApplicationButtonContainer>
                  }
                />
              }
              hubNameId={entities.hubNameId}
              challengeNameId={entities.challenge?.nameID}
              communityId={entities.challenge?.community?.id}
              childEntities={entities.challenge?.opportunities ?? undefined}
              childEntitiesCount={entities.opportunitiesCount}
              communityReadAccess={entities.permissions.communityReadAccess}
              entityReadAccess={entities.permissions.challengeReadAccess}
              readUsersAccess={entities.permissions.readUsers}
              references={entities.references}
              memberUsers={entities.memberUsers}
              memberUsersCount={entities.memberUsersCount}
              memberOrganizations={entities.memberOrganizations}
              memberOrganizationsCount={entities.memberOrganizationsCount}
              leadUsers={entities.challenge?.community?.leadUsers}
              leadOrganizations={entities.challenge?.community?.leadOrganizations}
              activities={entities.activities}
              activityLoading={state.activityLoading}
              topCallouts={entities.topCallouts}
              sendMessageToCommunityLeads={entities.sendMessageToCommunityLeads}
              renderChildEntityCard={opportunity => (
                <OpportunityCard
                  opportunityId={opportunity.id}
                  displayName={opportunity.profile.displayName}
                  tagline={opportunity.profile.tagline!}
                  vision={opportunity.context?.vision!}
                  innovationFlowState={opportunity.lifecycle?.state}
                  tags={opportunity.profile.tagset?.tags!}
                  banner={getVisualByType(VisualName.BANNERNARROW, opportunity.profile.visuals)}
                  journeyUri={buildOpportunityUrl(entities.hubNameId, entities.challenge!.nameID, opportunity.nameID)}
                  challengeDisplayName={entities.challenge?.profile.displayName!}
                  challengeUri={buildChallengeUrl(entities.hubNameId, entities.challenge!.nameID)}
                  hubVisibility={entities.hubVisibility}
                />
              )}
              journeyTypeName="challenge"
              childEntityTitle={t('common.opportunities')}
              recommendations={
                groupedCallouts[CalloutsGroup.HomeTop] && (
                  <CalloutsGroupView
                    callouts={groupedCallouts[CalloutsGroup.HomeTop]}
                    hubId={hubNameId!}
                    canCreateCallout={false}
                    loading={loading}
                    journeyTypeName="challenge"
                    sortOrder={calloutsSortOrder}
                    calloutNames={calloutNames}
                    onSortOrderUpdate={onCalloutsSortOrderUpdate}
                    onCalloutUpdate={refetchCallout}
                    group={CalloutsGroup.HomeTop}
                    disableMarginal
                    blockProps={{ sx: { minHeight: '100%' } }}
                  />
                )
              }
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
    </ChallengePageLayout>
  );
};

export default ChallengeDashboardPage;
