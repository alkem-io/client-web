import React, { FC } from 'react';
import { useResolvedPath } from 'react-router-dom';
import ChallengePageContainer from '../containers/ChallengePageContainer';
import ChallengePageLayout from '../layout/ChallengePageLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import useBackToParentPage from '../../../../core/routing/deprecated/useBackToParentPage';
import CommunityUpdatesDialog from '../../../community/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import ContributorsDialog from '../../../community/community/ContributorsDialog/ContributorsDialog';
import ChallengeContributorsDialogContent from '../../../community/community/entities/ChallengeContributorsDialogContent';
import JourneyDashboardView from '../../common/tabs/Dashboard/JourneyDashboardView';
import { useTranslation } from 'react-i18next';
import CalendarDialog from '../../../timeline/calendar/CalendarDialog';
import JourneyDashboardWelcomeBlock from '../../common/journeyDashboardWelcomeBlock/JourneyDashboardWelcomeBlock';
import useDirectMessageDialog from '../../../communication/messaging/DirectMessaging/useDirectMessageDialog';
import MembershipContainer from '../../../community/membership/membershipContainer/MembershipContainer';
import ApplicationButtonContainer from '../../../community/application/containers/ApplicationButtonContainer';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import ApplicationButton from '../../../community/application/applicationButton/ApplicationButton';
import FullWidthButton from '../../../../core/ui/button/FullWidthButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Theme } from '@mui/material';
import { buildUpdatesUrl } from '../../../../main/routing/urlBuilders';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

export interface ChallengeDashboardPageProps {
  dialog?: 'updates' | 'contributors' | 'calendar';
}

const ChallengeDashboardPage: FC<ChallengeDashboardPageProps> = ({ dialog }) => {
  const { t } = useTranslation();

  const currentPath = useResolvedPath('..');

  const [backToDashboard] = useBackToParentPage(`${currentPath.pathname}/dashboard`);

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  const hasExtendedApplicationButton = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  const { challengeId } = useRouteResolver();

  return (
    <ChallengePageLayout currentSection={EntityPageSection.Dashboard}>
      {directMessageDialog}
      <ChallengePageContainer challengeId={challengeId}>
        {({ callouts, ...entities }, state) => (
          <>
            <JourneyDashboardView
              journeyId={challengeId}
              journeyUrl={entities.challenge?.profile.url}
              ribbon={
                <ApplicationButtonContainer
                  challengeId={entities.challenge?.id}
                  challengeName={entities.challenge?.profile.displayName}
                >
                  {({ applicationButtonProps }, { loading }) => {
                    if (loading || applicationButtonProps.isMember) {
                      return null;
                    }

                    return (
                      <PageContentColumn columns={12}>
                        <ApplicationButton
                          {...applicationButtonProps}
                          loading={loading}
                          component={FullWidthButton}
                          extended={hasExtendedApplicationButton}
                          journeyTypeName="challenge"
                        />
                      </PageContentColumn>
                    );
                  }}
                </ApplicationButtonContainer>
              }
              welcome={
                <JourneyDashboardWelcomeBlock
                  vision={entities.challenge?.context?.vision ?? ''}
                  leadUsers={entities.challenge?.community?.leadUsers}
                  onContactLeadUser={receiver => sendMessage('user', receiver)}
                  leadOrganizations={entities.challenge?.community?.leadOrganizations}
                  onContactLeadOrganization={receiver => sendMessage('organization', receiver)}
                  journeyTypeName="space"
                >
                  {props => (
                    <MembershipContainer
                      challengeId={entities.challenge?.id}
                      challengeName={entities.challenge?.profile.displayName}
                      {...props}
                    />
                  )}
                </JourneyDashboardWelcomeBlock>
              }
              communityId={entities.challenge?.community?.id}
              communityReadAccess={entities.permissions.communityReadAccess}
              timelineReadAccess={entities.permissions.timelineReadAccess}
              entityReadAccess={entities.permissions.challengeReadAccess}
              readUsersAccess={entities.permissions.readUsers}
              references={entities.references}
              memberUsers={entities.memberUsers}
              memberUsersCount={entities.memberUsersCount}
              memberOrganizations={entities.memberOrganizations}
              memberOrganizationsCount={entities.memberOrganizationsCount}
              leadUsers={entities.challenge?.community?.leadUsers}
              activities={entities.activities}
              fetchMoreActivities={entities.fetchMoreActivities}
              activityLoading={state.activityLoading}
              topCallouts={entities.topCallouts}
              callouts={callouts}
              sendMessageToCommunityLeads={entities.sendMessageToCommunityLeads}
              journeyTypeName="challenge"
              shareUpdatesUrl={buildUpdatesUrl(entities.challenge?.profile.url ?? '')}
            />
            <CommunityUpdatesDialog
              open={dialog === 'updates'}
              onClose={backToDashboard}
              communityId={entities.challenge?.community?.id}
              shareUrl={buildUpdatesUrl(entities.challenge?.profile.url ?? '')}
              loading={state.loading}
            />
            <ContributorsDialog
              open={dialog === 'contributors'}
              onClose={backToDashboard}
              dialogContent={ChallengeContributorsDialogContent}
            />
            {entities.permissions.timelineReadAccess && (
              <CalendarDialog
                open={dialog === 'calendar'}
                onClose={backToDashboard}
                journeyId={challengeId}
                journeyTypeName="challenge"
              />
            )}
          </>
        )}
      </ChallengePageContainer>
    </ChallengePageLayout>
  );
};

export default ChallengeDashboardPage;
