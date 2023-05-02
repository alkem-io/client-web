import React, { FC } from 'react';
import { useResolvedPath } from 'react-router-dom';
import OpportunityPageContainer from '../containers/OpportunityPageContainer';
import CommunityUpdatesDialog from '../../../community/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import ContributorsDialog from '../../../community/community/ContributorsDialog/ContributorsDialog';
import OpportunityContributorsDialogContent from '../../../community/community/entities/OpportunityContributorsDialogContent';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';
import OpportunityPageLayout from '../layout/OpportunityPageLayout';
import JourneyDashboardView from '../../common/tabs/Dashboard/JourneyDashboardView';
import CalloutsGroupView from '../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';
import { CalloutsGroup } from '../../../collaboration/callout/CalloutsInContext/CalloutsGroup';
import useCallouts from '../../../collaboration/callout/useCallouts/useCallouts';
import { useUrlParams } from '../../../../core/routing/useUrlParams';

export interface OpportunityDashboardPageProps {
  dialog?: 'updates' | 'contributors';
}

const OpportunityDashboardPage: FC<OpportunityDashboardPageProps> = ({ dialog }) => {
  const currentPath = useResolvedPath('..');

  const [backToDashboard] = useBackToParentPage(`${currentPath.pathname}/dashboard`);

  const { hubNameId, opportunityNameId } = useUrlParams();

  const { groupedCallouts, calloutNames, loading, calloutsSortOrder, onCalloutsSortOrderUpdate } = useCallouts({
    hubNameId,
    opportunityNameId,
    calloutGroups: [CalloutsGroup.HomeTop],
  });

  return (
    <OpportunityPageLayout currentSection={EntityPageSection.Dashboard}>
      <OpportunityPageContainer>
        {(entities, state) => (
          <>
            <JourneyDashboardView
              vision={entities.opportunity?.context?.vision}
              hubNameId={entities.hubNameId}
              challengeNameId={entities.challengeNameId}
              opportunityNameId={entities.opportunity?.nameID}
              communityId={entities.opportunity?.community?.id}
              communityReadAccess={entities.permissions.communityReadAccess}
              entityReadAccess={entities.permissions.opportunityReadAccess}
              readUsersAccess={entities.permissions.readUsers}
              references={entities.references}
              memberUsers={entities.memberUsers}
              memberUsersCount={entities.memberUsersCount}
              memberOrganizations={entities.memberOrganizations}
              memberOrganizationsCount={entities.memberOrganizationsCount}
              leadUsers={entities.opportunity?.community?.leadUsers}
              leadOrganizations={entities.opportunity?.community?.leadOrganizations}
              activities={entities.activities}
              activityLoading={state.activityLoading}
              journeyTypeName="opportunity"
              topCallouts={entities.topCallouts}
              sendMessageToCommunityLeads={entities.sendMessageToCommunityLeads}
              recommendations={
                groupedCallouts[CalloutsGroup.HomeTop] && (
                  <CalloutsGroupView
                    callouts={groupedCallouts[CalloutsGroup.HomeTop]}
                    hubId={hubNameId!}
                    canCreateCallout={false}
                    loading={loading}
                    entityTypeName="opportunity"
                    sortOrder={calloutsSortOrder}
                    calloutNames={calloutNames}
                    onSortOrderUpdate={onCalloutsSortOrderUpdate}
                    group={CalloutsGroup.HomeTop}
                  />
                )
              }
            />
            <CommunityUpdatesDialog
              open={dialog === 'updates'}
              onClose={backToDashboard}
              hubId={entities.hubId}
              communityId={entities.opportunity?.community?.id}
            />
            <ContributorsDialog
              open={dialog === 'contributors'}
              onClose={backToDashboard}
              dialogContent={OpportunityContributorsDialogContent}
            />
          </>
        )}
      </OpportunityPageContainer>
    </OpportunityPageLayout>
  );
};

export default OpportunityDashboardPage;
