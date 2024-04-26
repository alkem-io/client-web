import React, { FC } from 'react';
import { useResolvedPath } from 'react-router-dom';
import SubspacePageContainer from '../containers/SubspacePageContainer';
import SubspacePageLayout from '../layout/SubspacePageLayout';
import useBackToParentPage from '../../../../core/routing/deprecated/useBackToParentPage';
import CommunityUpdatesDialog from '../../../community/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import ContributorsDialog from '../../../community/community/ContributorsDialog/ContributorsDialog';
import ChallengeContributorsDialogContent from '../../../community/community/entities/ChallengeContributorsDialogContent';
import JourneyDashboardView from '../../common/tabs/Dashboard/JourneyDashboardView';
import { useTranslation } from 'react-i18next';
import CalendarDialog from '../../../timeline/calendar/CalendarDialog';
import JourneyDashboardWelcomeBlock from '../../common/journeyDashboardWelcomeBlock/JourneyDashboardWelcomeBlock';
import useDirectMessageDialog from '../../../communication/messaging/DirectMessaging/useDirectMessageDialog';
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

  const { subSpaceId: challengeId, journeyId, journeyPath } = useRouteResolver();

  return (
    <SubspacePageLayout journeyId={journeyId} journeyPath={journeyPath}>
      {directMessageDialog}
      <SubspacePageContainer challengeId={challengeId}>
        {({ callouts, ...entities }, state) => (
          <>
            <JourneyDashboardView
              journeyId={challengeId}
              journeyUrl={entities.challenge?.profile.url}
              ribbon={
                <ApplicationButtonContainer
                  subspaceId={entities.challenge?.id}
                  subspaceName={entities.challenge?.profile.displayName}
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
                          journeyTypeName="subspace"
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
                  member={entities.isMember}
                />
              }
              communityId={entities.challenge?.community?.id}
              communityReadAccess={entities.permissions.communityReadAccess}
              timelineReadAccess={entities.permissions.timelineReadAccess}
              entityReadAccess={entities.permissions.subspaceReadAccess}
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
              journeyTypeName="subspace"
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
                parentPath=""
              />
            )}
          </>
        )}
      </SubspacePageContainer>
    </SubspacePageLayout>
  );
};

export default ChallengeDashboardPage;
