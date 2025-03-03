import { PropsWithChildren } from 'react';
import { useResolvedPath } from 'react-router-dom';
import SpaceDashboardContainer from './SpaceDashboardContainer';
import CommunityUpdatesDialog from '@/domain/community/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import ContributorsDialog from '@/domain/community/community/ContributorsDialog/ContributorsDialog';
import SpaceContributorsDialogContent from '@/domain/community/community/entities/SpaceContributorsDialogContent';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import useBackToParentPage from '@/core/routing/deprecated/useBackToParentPage';
import SpacePageLayout from '../layout/SpacePageLayout';
import SpaceDashboardView from './SpaceDashboardView';
import CalendarDialog from '@/domain/timeline/calendar/CalendarDialog';
import SpaceAboutDialog from '@/domain/space/about/SpaceAboutDialog';
import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { buildUpdatesUrl } from '@/main/routing/urlBuilders';
import { useTranslation } from 'react-i18next';
import CommunityGuidelinesBlock from '@/domain/community/community/CommunityGuidelines/CommunityGuidelinesBlock';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import useSpaceTabProvider from '@/domain/space/layout/TabbedSpaceL0/SpaceTab';

const SpaceDashboardPage = ({
  dialog,
}: PropsWithChildren<{ dialog?: 'about' | 'updates' | 'contributors' | 'calendar' }>) => {
  const { t } = useTranslation();
  const currentPath = useResolvedPath('..');

  const [backToDashboard] = useBackToParentPage(`${currentPath.pathname}/dashboard`);

  const { urlInfo } = useSpaceTabProvider({ tabPosition: 0 });

  const { spaceId, collaborationId, journeyPath, calendarEventId } = urlInfo;

  return (
    <SpacePageLayout journeyPath={journeyPath} currentSection={EntityPageSection.Dashboard}>
      <SpaceDashboardContainer spaceId={spaceId}>
        {({ callouts, dashboardNavigation, about, ...entities }, state) => (
          <>
            <SpaceDashboardView
              spaceId={spaceId}
              innovationFlowStates={entities.innovationFlowStates}
              collaborationId={collaborationId}
              calloutsSetId={entities.space?.collaboration?.calloutsSet?.id}
              what={entities.space?.about.profile.description}
              dashboardNavigation={dashboardNavigation}
              dashboardNavigationLoading={state.loading}
              loading={state.loading}
              communityId={entities.space?.community?.id}
              communityReadAccess={entities.permissions.communityReadAccess}
              timelineReadAccess={entities.permissions.timelineReadAccess}
              entityReadAccess={entities.permissions.spaceReadAccess}
              readUsersAccess={entities.permissions.readUsers}
              leadUsers={entities.space?.community?.roleSet?.leadUsers ?? []}
              host={entities.provider}
              callouts={callouts}
              level={entities.space?.level}
              myMembershipStatus={entities.space?.community?.roleSet?.myMembershipStatus}
              shareUpdatesUrl={buildUpdatesUrl(entities.space?.about.profile.url ?? '')}
            />
            <CommunityUpdatesDialog
              open={dialog === 'updates'}
              onClose={backToDashboard}
              communityId={entities.space?.community?.id}
              shareUrl={buildUpdatesUrl(entities.space?.about.profile.url ?? '')}
              loading={state.loading}
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
                journeyId={spaceId}
                parentSpaceId={undefined}
                parentPath={entities.space?.about.profile.url ?? ''}
                calendarEventId={calendarEventId}
              />
            )}
            <SpaceAboutDialog
              open={dialog === 'about'}
              spaceLevel={SpaceLevel.L0}
              about={about}
              sendMessageToCommunityLeads={entities.sendMessageToCommunityLeads}
              metrics={entities.space?.metrics}
              guidelines={
                <CommunityGuidelinesBlock
                  communityId={entities.space?.community?.id}
                  journeyUrl={entities.space?.about.profile.url}
                />
              }
              loading={state.loading}
              leadUsers={entities.space?.community?.roleSet?.leadUsers}
              provider={entities.provider}
              leadOrganizations={entities.space?.community?.roleSet?.leadOrganizations}
              endButton={
                <IconButton onClick={backToDashboard} aria-label={t('buttons.close')}>
                  <Close />
                </IconButton>
              }
            />
          </>
        )}
      </SpaceDashboardContainer>
    </SpacePageLayout>
  );
};

export default SpaceDashboardPage;
