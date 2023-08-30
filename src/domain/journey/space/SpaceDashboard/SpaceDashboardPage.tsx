import React, { FC } from 'react';
import { useResolvedPath } from 'react-router-dom';
import SpaceDashboardContainer from './SpaceDashboardContainer';
import CommunityUpdatesDialog from '../../../community/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import ContributorsDialog from '../../../community/community/ContributorsDialog/ContributorsDialog';
import SpaceContributorsDialogContent from '../../../community/community/entities/SpaceContributorsDialogContent';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';
import SpacePageLayout from '../layout/SpacePageLayout';
import SpaceDashboardView from './SpaceDashboardView';
import ChallengeCard from '../../challenge/ChallengeCard/ChallengeCard';
import { useTranslation } from 'react-i18next';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { buildChallengeUrl, buildSpaceUrl } from '../../../../main/routing/urlBuilders';
import CalendarDialog from '../../../timeline/calendar/CalendarDialog';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import CalloutsGroupView from '../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';
import { VisualName } from '../../../common/visual/constants/visuals.constants';
import useSpaceDashboardNavigation from '../SpaceDashboardNavigation/useSpaceDashboardNavigation';
import { CalloutDisplayLocation, CommunityMembershipStatus } from '../../../../core/apollo/generated/graphql-schema';

export interface SpaceDashboardPageProps {
  dialog?: 'updates' | 'contributors' | 'calendar';
}

const SpaceDashboardPage: FC<SpaceDashboardPageProps> = ({ dialog }) => {
  const currentPath = useResolvedPath('..');

  const [backToDashboard] = useBackToParentPage(`${currentPath.pathname}/dashboard`);

  const { t } = useTranslation();

  const { spaceNameId } = useUrlParams();

  if (!spaceNameId) {
    throw new Error('Param :spaceNameId is missing');
  }

  const { dashboardNavigation, loading: dashboardNavigationLoading } = useSpaceDashboardNavigation({
    spaceId: spaceNameId,
  });

  return (
    <SpacePageLayout currentSection={EntityPageSection.Dashboard}>
      <SpaceDashboardContainer>
        {({ callouts, ...entities }, state) => (
          <>
            <SpaceDashboardView
              vision={entities.space?.context?.vision}
              spaceNameId={entities.space?.nameID}
              displayName={entities.space?.profile.displayName}
              tagline={entities.space?.profile.tagline}
              description={entities.space?.profile.description}
              dashboardNavigation={dashboardNavigation}
              dashboardNavigationLoading={dashboardNavigationLoading}
              who={entities.space?.context?.who}
              impact={entities.space?.context?.impact}
              spaceVisibility={entities.space?.visibility}
              metrics={entities.space?.metrics}
              loading={state.loading}
              communityId={entities.space?.community?.id}
              childEntities={entities.challenges}
              childEntitiesCount={entities.challengesCount}
              communityReadAccess={entities.permissions.communityReadAccess}
              timelineReadAccess={entities.permissions.timelineReadAccess}
              entityReadAccess={entities.permissions.spaceReadAccess}
              readUsersAccess={entities.permissions.readUsers}
              references={entities.references}
              leadUsers={entities.space?.community?.leadUsers}
              hostOrganizations={entities.hostOrganizations}
              leadOrganizations={entities.space?.community?.leadOrganizations}
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
                  innovationFlowState={challenge.innovationFlow?.lifecycle?.state}
                  journeyUri={buildChallengeUrl(entities.space!.nameID, challenge.nameID)}
                  spaceDisplayName={entities.space!.profile.displayName}
                  spaceUri={buildSpaceUrl(entities.space!.nameID)}
                  spaceVisibility={entities.space!.visibility}
                  member={challenge.community?.myMembershipStatus === CommunityMembershipStatus.Member}
                />
              )}
              journeyTypeName="space"
              childEntityTitle={t('common.challenges')}
              recommendations={
                callouts.groupedCallouts[CalloutDisplayLocation.HomeTop] && (
                  <CalloutsGroupView
                    callouts={callouts.groupedCallouts[CalloutDisplayLocation.HomeTop]}
                    spaceId={spaceNameId!}
                    canCreateCallout={false}
                    loading={callouts.loading}
                    journeyTypeName="space"
                    calloutNames={callouts.calloutNames}
                    onSortOrderUpdate={callouts.onCalloutsSortOrderUpdate}
                    onCalloutUpdate={callouts.refetchCallout}
                    displayLocation={CalloutDisplayLocation.HomeTop}
                    disableMarginal
                    blockProps={{ sx: { minHeight: '100%' } }}
                  />
                )
              }
              childrenLeft={
                <CalloutsGroupView
                  callouts={callouts.groupedCallouts[CalloutDisplayLocation.HomeLeft]}
                  spaceId={spaceNameId!}
                  canCreateCallout={callouts.canCreateCallout}
                  loading={callouts.loading}
                  journeyTypeName="space"
                  calloutNames={callouts.calloutNames}
                  onSortOrderUpdate={callouts.onCalloutsSortOrderUpdate}
                  onCalloutUpdate={callouts.refetchCallout}
                  displayLocation={CalloutDisplayLocation.HomeLeft}
                />
              }
              childrenRight={
                <CalloutsGroupView
                  callouts={callouts.groupedCallouts[CalloutDisplayLocation.HomeRight]}
                  spaceId={spaceNameId!}
                  canCreateCallout={callouts.canCreateCallout}
                  loading={callouts.loading}
                  journeyTypeName="space"
                  calloutNames={callouts.calloutNames}
                  onSortOrderUpdate={callouts.onCalloutsSortOrderUpdate}
                  onCalloutUpdate={callouts.refetchCallout}
                  displayLocation={CalloutDisplayLocation.HomeRight}
                />
              }
            />
            <CommunityUpdatesDialog
              open={dialog === 'updates'}
              onClose={backToDashboard}
              spaceId={entities.space?.id}
              communityId={entities.space?.community?.id}
            />
            <ContributorsDialog
              open={dialog === 'contributors'}
              onClose={backToDashboard}
              dialogContent={SpaceContributorsDialogContent}
            />
            {entities.permissions.timelineReadAccess && (
              <CalendarDialog
                open={dialog === 'calendar'}
                onClose={backToDashboard}
                spaceNameId={entities.space?.nameID}
              />
            )}
          </>
        )}
      </SpaceDashboardContainer>
    </SpacePageLayout>
  );
};

export default SpaceDashboardPage;
