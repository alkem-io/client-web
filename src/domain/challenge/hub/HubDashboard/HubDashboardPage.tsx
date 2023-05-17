import React, { FC } from 'react';
import { useResolvedPath } from 'react-router-dom';
import HubDashboardContainer from './HubDashboardContainer';
import CommunityUpdatesDialog from '../../../community/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import ContributorsDialog from '../../../community/community/ContributorsDialog/ContributorsDialog';
import HubContributorsDialogContent from '../../../community/community/entities/HubContributorsDialogContent';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';
import HubPageLayout from '../layout/HubPageLayout';
import HubDashboardView from './HubDashboardView';
import ChallengeCard from '../../challenge/ChallengeCard/ChallengeCard';
import { useTranslation } from 'react-i18next';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { buildChallengeUrl, buildHubUrl } from '../../../../common/utils/urlBuilders';
import CalendarDialog from '../../../timeline/calendar/CalendarDialog';
import useCallouts from '../../../collaboration/callout/useCallouts/useCallouts';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { CalloutsGroup } from '../../../collaboration/callout/CalloutsInContext/CalloutsGroup';
import CalloutsGroupView from '../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';
import { VisualName } from '../../../common/visual/constants/visuals.constants';
import useHubDashboardNavigation from '../HubDashboardNavigation/useHubDashboardNavigation';

export interface HubDashboardPageProps {
  dialog?: 'updates' | 'contributors' | 'calendar';
}

const HubDashboardPage: FC<HubDashboardPageProps> = ({ dialog }) => {
  const currentPath = useResolvedPath('..');

  const [backToDashboard] = useBackToParentPage(`${currentPath.pathname}/dashboard`);

  const { t } = useTranslation();

  const { hubNameId } = useUrlParams();

  if (!hubNameId) {
    throw new Error('Param :hubNameId is missing');
  }

  const {
    groupedCallouts,
    canCreateCallout,
    calloutNames,
    loading,
    calloutsSortOrder,
    onCalloutsSortOrderUpdate,
    refetchCallout,
  } = useCallouts({
    hubNameId,
    calloutGroups: [CalloutsGroup.HomeTop, CalloutsGroup.HomeLeft, CalloutsGroup.HomeRight],
  });

  const { dashboardNavigation, loading: dashboardNavigationLoading } = useHubDashboardNavigation({ hubId: hubNameId });

  return (
    <HubPageLayout currentSection={EntityPageSection.Dashboard}>
      <HubDashboardContainer>
        {(entities, state) => (
          <>
            <HubDashboardView
              vision={entities.hub?.context?.vision}
              hubNameId={entities.hub?.nameID}
              displayName={entities.hub?.profile.displayName}
              tagline={entities.hub?.profile.tagline}
              description={entities.hub?.profile.description}
              dashboardNavigation={dashboardNavigation}
              dashboardNavigationLoading={dashboardNavigationLoading}
              who={entities.hub?.context?.who}
              impact={entities.hub?.context?.impact}
              hubVisibility={entities.hub?.visibility}
              metrics={entities.hub?.metrics}
              loading={state.loading}
              communityId={entities.hub?.community?.id}
              childEntities={entities.challenges}
              childEntitiesCount={entities.challengesCount}
              communityReadAccess={entities.permissions.communityReadAccess}
              timelineReadAccess={entities.permissions.timelineReadAccess}
              entityReadAccess={entities.permissions.hubReadAccess}
              readUsersAccess={entities.permissions.readUsers}
              references={entities.references}
              leadUsers={entities.hub?.community?.leadUsers}
              leadOrganizations={entities.hostOrganizations}
              activities={entities.activities}
              activityLoading={entities.activityLoading}
              topCallouts={entities.topCallouts}
              sendMessageToCommunityLeads={entities.sendMessageToCommunityLeads}
              renderChildEntityCard={challenge => (
                <ChallengeCard
                  challengeId={challenge.id}
                  challengeNameId={challenge.nameID}
                  banner={getVisualByType(VisualName.BANNERNARROW, challenge.profile.visuals)}
                  displayName={challenge.profile.displayName}
                  tags={challenge.profile.tagset?.tags!}
                  tagline={challenge.profile.tagline!}
                  vision={challenge.context?.vision!}
                  innovationFlowState={challenge.lifecycle?.state}
                  journeyUri={buildChallengeUrl(entities.hub!.nameID, challenge.nameID)}
                  hubDisplayName={entities.hub!.profile.displayName}
                  hubUri={buildHubUrl(entities.hub!.nameID)}
                  hubVisibility={entities.hub!.visibility}
                />
              )}
              journeyTypeName="hub"
              childEntityTitle={t('common.challenges')}
              recommendations={
                groupedCallouts[CalloutsGroup.HomeTop] && (
                  <CalloutsGroupView
                    callouts={groupedCallouts[CalloutsGroup.HomeTop]}
                    hubId={hubNameId!}
                    canCreateCallout={false}
                    loading={loading}
                    journeyTypeName="hub"
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
              childrenLeft={
                <CalloutsGroupView
                  callouts={groupedCallouts[CalloutsGroup.HomeLeft]}
                  hubId={hubNameId!}
                  canCreateCallout={canCreateCallout}
                  loading={loading}
                  journeyTypeName="hub"
                  sortOrder={calloutsSortOrder}
                  calloutNames={calloutNames}
                  onSortOrderUpdate={onCalloutsSortOrderUpdate}
                  onCalloutUpdate={refetchCallout}
                  group={CalloutsGroup.HomeLeft}
                />
              }
              childrenRight={
                <CalloutsGroupView
                  callouts={groupedCallouts[CalloutsGroup.HomeRight]}
                  hubId={hubNameId!}
                  canCreateCallout={canCreateCallout}
                  loading={loading}
                  journeyTypeName="hub"
                  sortOrder={calloutsSortOrder}
                  calloutNames={calloutNames}
                  onSortOrderUpdate={onCalloutsSortOrderUpdate}
                  onCalloutUpdate={refetchCallout}
                  group={CalloutsGroup.HomeRight}
                />
              }
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
            {entities.permissions.timelineReadAccess && (
              <CalendarDialog open={dialog === 'calendar'} onClose={backToDashboard} hubNameId={entities.hub?.nameID} />
            )}
          </>
        )}
      </HubDashboardContainer>
    </HubPageLayout>
  );
};

export default HubDashboardPage;
