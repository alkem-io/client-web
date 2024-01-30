import React, { FC } from 'react';
import { useResolvedPath } from 'react-router-dom';
import OpportunityPageContainer from '../containers/OpportunityPageContainer';
import CommunityUpdatesDialog from '../../../community/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import ContributorsDialog from '../../../community/community/ContributorsDialog/ContributorsDialog';
import OpportunityContributorsDialogContent from '../../../community/community/entities/OpportunityContributorsDialogContent';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import useBackToParentPage from '../../../../core/routing/deprecated/useBackToParentPage';
import OpportunityPageLayout from '../layout/OpportunityPageLayout';
import JourneyDashboardView from '../../common/tabs/Dashboard/JourneyDashboardView';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import CalendarDialog from '../../../timeline/calendar/CalendarDialog';
import MembershipContainer from '../../../community/membership/membershipContainer/MembershipContainer';
import JourneyDashboardWelcomeBlock from '../../common/journeyDashboardWelcomeBlock/JourneyDashboardWelcomeBlock';
import useDirectMessageDialog from '../../../communication/messaging/DirectMessaging/useDirectMessageDialog';
import { useTranslation } from 'react-i18next';
import { buildUpdatesUrl } from '../../../../main/routing/urlBuilders';

export interface OpportunityDashboardPageProps {
  dialog?: 'updates' | 'contributors' | 'calendar';
}

const OpportunityDashboardPage: FC<OpportunityDashboardPageProps> = ({ dialog }) => {
  const { t } = useTranslation();

  const currentPath = useResolvedPath('..');

  const [backToDashboard] = useBackToParentPage(`${currentPath.pathname}/dashboard`);

  const { spaceNameId, challengeNameId, opportunityNameId } = useUrlParams();

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  if (!spaceNameId) {
    throw new Error('Must be within a Space route.');
  }
  const shareUpdatesUrl = buildUpdatesUrl({ spaceNameId, challengeNameId, opportunityNameId });

  return (
    <OpportunityPageLayout currentSection={EntityPageSection.Dashboard}>
      {directMessageDialog}
      <OpportunityPageContainer>
        {({ callouts, ...entities }, state) => (
          <>
            <JourneyDashboardView
              welcome={
                <JourneyDashboardWelcomeBlock
                  vision={entities.opportunity?.context?.vision ?? ''}
                  leadUsers={entities.opportunity?.community?.leadUsers}
                  onContactLeadUser={receiver => sendMessage('user', receiver)}
                  leadOrganizations={entities.opportunity?.community?.leadOrganizations}
                  onContactLeadOrganization={receiver => sendMessage('organization', receiver)}
                  journeyTypeName="space"
                >
                  {props => <MembershipContainer {...props} />}
                </JourneyDashboardWelcomeBlock>
              }
              spaceNameId={entities.spaceNameId}
              challengeNameId={entities.challengeNameId}
              opportunityNameId={entities.opportunity?.nameID}
              communityId={entities.opportunity?.community?.id}
              communityReadAccess={entities.permissions.communityReadAccess}
              timelineReadAccess={entities.permissions.timelineReadAccess}
              entityReadAccess={entities.permissions.opportunityReadAccess}
              readUsersAccess={entities.permissions.readUsers}
              references={entities.references}
              memberUsers={entities.memberUsers}
              memberUsersCount={entities.memberUsersCount}
              memberOrganizations={entities.memberOrganizations}
              memberOrganizationsCount={entities.memberOrganizationsCount}
              leadUsers={entities.opportunity?.community?.leadUsers}
              activities={entities.activities}
              fetchMoreActivities={entities.fetchMoreActivities}
              activityLoading={state.activityLoading}
              journeyTypeName="opportunity"
              topCallouts={entities.topCallouts}
              callouts={callouts}
              sendMessageToCommunityLeads={entities.sendMessageToCommunityLeads}
              shareUpdatesUrl={shareUpdatesUrl}
            />
            <CommunityUpdatesDialog
              open={dialog === 'updates'}
              onClose={backToDashboard}
              spaceId={entities.spaceId}
              communityId={entities.opportunity?.community?.id}
              shareUrl={shareUpdatesUrl}
              loading={state.loading}
            />
            <ContributorsDialog
              open={dialog === 'contributors'}
              onClose={backToDashboard}
              dialogContent={OpportunityContributorsDialogContent}
            />
            {entities.permissions.timelineReadAccess && (
              <CalendarDialog
                open={dialog === 'calendar'}
                onClose={backToDashboard}
                spaceNameId={spaceNameId}
                opportunityNameId={entities.opportunity?.nameID}
              />
            )}
          </>
        )}
      </OpportunityPageContainer>
    </OpportunityPageLayout>
  );
};

export default OpportunityDashboardPage;
