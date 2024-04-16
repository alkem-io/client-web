import React, { FC } from 'react';
import { useResolvedPath } from 'react-router-dom';
import OpportunityPageContainer from '../containers/OpportunityPageContainer';
import CommunityUpdatesDialog from '../../../community/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import ContributorsDialog from '../../../community/community/ContributorsDialog/ContributorsDialog';
import OpportunityContributorsDialogContent from '../../../community/community/entities/OpportunityContributorsDialogContent';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { SubspacePageLayout } from '../../common/EntityPageLayout';
import JourneyDashboardView from '../../common/tabs/Dashboard/JourneyDashboardView';
import CalendarDialog from '../../../timeline/calendar/CalendarDialog';
import JourneyDashboardWelcomeBlock from '../../common/journeyDashboardWelcomeBlock/JourneyDashboardWelcomeBlock';
import useDirectMessageDialog from '../../../communication/messaging/DirectMessaging/useDirectMessageDialog';
import { useTranslation } from 'react-i18next';
import { buildUpdatesUrl } from '../../../../main/routing/urlBuilders';
import OpportunityApplicationButtonContainer from '../../../community/application/containers/OpportunityApplicationButtonContainer';
import OpportunityApplicationButton from '../../../community/application/applicationButton/OpportunityApplicationButton';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import FullWidthButton from '../../../../core/ui/button/FullWidthButton';
import { Theme, useMediaQuery } from '@mui/material';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';
import { useBackToStaticPath } from '../../../../core/routing/useBackToPath';

export interface OpportunityDashboardPageProps {
  dialog?: 'updates' | 'contributors' | 'calendar';
}

const OpportunityDashboardPage: FC<OpportunityDashboardPageProps> = ({ dialog }) => {
  const { t } = useTranslation();

  const currentPath = useResolvedPath('..');

  const backToDashboard = useBackToStaticPath(`${currentPath.pathname}/dashboard`);

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  const hasExtendedApplicationButton = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  const { subSpaceId: challengeId, subSubSpaceId: opportunityId, journeyId, journeyPath } = useRouteResolver();

  return (
    <SubspacePageLayout journeyId={journeyId} journeyPath={journeyPath} currentSection={EntityPageSection.Dashboard}>
      {directMessageDialog}
      <OpportunityPageContainer opportunityId={opportunityId}>
        {({ callouts, ...entities }, state) => (
          <>
            <JourneyDashboardView
              journeyId={opportunityId}
              journeyUrl={entities.subsubspace?.profile.url}
              ribbon={
                <OpportunityApplicationButtonContainer challengeId={challengeId} opportunityId={opportunityId}>
                  {({ applicationButtonProps, state: { loading } }) => {
                    if (loading || applicationButtonProps.isMember) {
                      return null;
                    }

                    return (
                      <PageContentColumn columns={12}>
                        <OpportunityApplicationButton
                          {...applicationButtonProps}
                          loading={loading}
                          component={FullWidthButton}
                          extended={hasExtendedApplicationButton}
                        />
                      </PageContentColumn>
                    );
                  }}
                </OpportunityApplicationButtonContainer>
              }
              welcome={
                <JourneyDashboardWelcomeBlock
                  vision={entities.subsubspace?.context?.vision ?? ''}
                  leadUsers={entities.subsubspace?.community?.leadUsers}
                  onContactLeadUser={receiver => sendMessage('user', receiver)}
                  leadOrganizations={entities.subsubspace?.community?.leadOrganizations}
                  onContactLeadOrganization={receiver => sendMessage('organization', receiver)}
                  journeyTypeName="space"
                  member={false}
                />
              }
              communityId={entities.subsubspace?.community?.id}
              communityReadAccess={entities.permissions.communityReadAccess}
              timelineReadAccess={entities.permissions.timelineReadAccess}
              entityReadAccess={entities.permissions.subsubspaceReadAccess}
              readUsersAccess={entities.permissions.readUsers}
              references={entities.references}
              memberUsers={entities.memberUsers}
              memberUsersCount={entities.memberUsersCount}
              memberOrganizations={entities.memberOrganizations}
              memberOrganizationsCount={entities.memberOrganizationsCount}
              leadUsers={entities.subsubspace?.community?.leadUsers}
              activities={entities.activities}
              fetchMoreActivities={entities.fetchMoreActivities}
              activityLoading={state.activityLoading}
              journeyTypeName="subsubspace"
              topCallouts={entities.topCallouts}
              callouts={callouts}
              sendMessageToCommunityLeads={entities.sendMessageToCommunityLeads}
              shareUpdatesUrl={buildUpdatesUrl(entities.subsubspace?.profile.url ?? '')}
            />
            <CommunityUpdatesDialog
              open={dialog === 'updates'}
              onClose={backToDashboard}
              communityId={entities.subsubspace?.community?.id}
              shareUrl={buildUpdatesUrl(entities.subsubspace?.profile.url ?? '')}
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
                journeyId={opportunityId}
                journeyTypeName="subsubspace"
              />
            )}
          </>
        )}
      </OpportunityPageContainer>
    </SubspacePageLayout>
  );
};

export default OpportunityDashboardPage;
