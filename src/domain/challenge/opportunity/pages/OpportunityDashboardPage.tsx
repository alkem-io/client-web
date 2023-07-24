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
import useCallouts from '../../../collaboration/callout/useCallouts/useCallouts';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import ApplicationButtonContainer from '../../../community/application/containers/ApplicationButtonContainer';
import JourneyDashboardVision from '../../common/tabs/Dashboard/JourneyDashboardVision';
import DashboardMemberIcon from '../../../community/membership/DashboardMemberIcon/DashboardMemberIcon';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { useTranslation } from 'react-i18next';
import { CalloutDisplayLocation } from '../../../../core/apollo/generated/graphql-schema';
import { CalloutDisplayLocationValuesMap } from '../../../collaboration/callout/CalloutsInContext/CalloutsGroup';

export interface OpportunityDashboardPageProps {
  dialog?: 'updates' | 'contributors';
}

const OpportunityDashboardPage: FC<OpportunityDashboardPageProps> = ({ dialog }) => {
  const currentPath = useResolvedPath('..');

  const [backToDashboard] = useBackToParentPage(`${currentPath.pathname}/dashboard`);

  const { spaceNameId, opportunityNameId } = useUrlParams();

  const { groupedCallouts, calloutNames, loading, calloutsSortOrder, onCalloutsSortOrderUpdate, refetchCallout } =
    useCallouts({
      spaceNameId,
      opportunityNameId,
      calloutGroups: [
        CalloutDisplayLocation.HomeTop,
        CalloutDisplayLocation.HomeLeft,
        CalloutDisplayLocation.HomeRight,
      ],
    });

  const { t } = useTranslation();

  return (
    <OpportunityPageLayout currentSection={EntityPageSection.Dashboard}>
      <OpportunityPageContainer>
        {(entities, state) => (
          <>
            <JourneyDashboardView
              vision={
                <JourneyDashboardVision
                  header={
                    <PageContentBlockHeader
                      title={`${t('common.welcome')}!`}
                      actions={
                        <ApplicationButtonContainer>
                          {({ applicationButtonProps }) =>
                            applicationButtonProps.isMember && <DashboardMemberIcon journeyTypeName="opportunity" />
                          }
                        </ApplicationButtonContainer>
                      }
                    />
                  }
                  vision={entities.opportunity?.context?.vision}
                  journeyTypeName="opportunity"
                />
              }
              spaceNameId={entities.spaceNameId}
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
                groupedCallouts[CalloutDisplayLocationValuesMap.HomeTop] && (
                  <CalloutsGroupView
                    callouts={groupedCallouts[CalloutDisplayLocationValuesMap.HomeTop]}
                    spaceId={spaceNameId!}
                    canCreateCallout={false}
                    loading={loading}
                    journeyTypeName="opportunity"
                    sortOrder={calloutsSortOrder}
                    calloutNames={calloutNames}
                    onSortOrderUpdate={onCalloutsSortOrderUpdate}
                    onCalloutUpdate={refetchCallout}
                    group={CalloutDisplayLocation.HomeTop}
                    disableMarginal
                    blockProps={{ sx: { minHeight: '100%' } }}
                  />
                )
              }
            />
            <CommunityUpdatesDialog
              open={dialog === 'updates'}
              onClose={backToDashboard}
              spaceId={entities.spaceId}
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
