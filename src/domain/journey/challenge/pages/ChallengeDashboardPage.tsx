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
import { useTranslation } from 'react-i18next';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
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

export interface ChallengeDashboardPageProps {
  dialog?: 'updates' | 'contributors' | 'calendar';
}

const ChallengeDashboardPage: FC<ChallengeDashboardPageProps> = ({ dialog }) => {
  const { t } = useTranslation();

  const currentPath = useResolvedPath('..');

  const [backToDashboard] = useBackToParentPage(`${currentPath.pathname}/dashboard`);

  const { spaceNameId, challengeNameId } = useUrlParams();

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  const hasExtendedApplicationButton = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  if (!spaceNameId) {
    throw new Error('Must be within a Space route.');
  }
  const shareUrl = buildUpdatesUrl({ spaceNameId, challengeNameId });

  return (
    <ChallengePageLayout currentSection={EntityPageSection.Dashboard}>
      {directMessageDialog}
      <ChallengePageContainer>
        {({ callouts, ...entities }, state) => (
          <>
            <JourneyDashboardView
              ribbon={
                <ApplicationButtonContainer
                  challengeId={entities.challenge?.id}
                  challengeNameId={challengeNameId}
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
                      challengeNameId={challengeNameId}
                      challengeName={entities.challenge?.profile.displayName}
                      {...props}
                    />
                  )}
                </JourneyDashboardWelcomeBlock>
              }
              spaceNameId={entities.spaceNameId}
              challengeNameId={entities.challenge?.nameID}
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
            />
            <CommunityUpdatesDialog
              open={dialog === 'updates'}
              onClose={backToDashboard}
              spaceId={entities.spaceId}
              communityId={entities.challenge?.community?.id}
              shareUrl={shareUrl}
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
                spaceNameId={spaceNameId}
                challengeNameId={entities.challenge?.nameID}
              />
            )}
          </>
        )}
      </ChallengePageContainer>
    </ChallengePageLayout>
  );
};

export default ChallengeDashboardPage;
