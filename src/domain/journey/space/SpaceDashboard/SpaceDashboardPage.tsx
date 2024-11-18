import React, { FC } from 'react';
import { useParams, useResolvedPath } from 'react-router-dom';
import SpaceDashboardContainer from './SpaceDashboardContainer';
import CommunityUpdatesDialog from '../../../community/community/CommunityUpdatesDialog/CommunityUpdatesDialog';
import ContributorsDialog from '../../../community/community/ContributorsDialog/ContributorsDialog';
import SpaceContributorsDialogContent from '../../../community/community/entities/SpaceContributorsDialogContent';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import useBackToParentPage from '@/core/routing/deprecated/useBackToParentPage';
import SpacePageLayout from '../layout/SpacePageLayout';
import SpaceDashboardView from './SpaceDashboardView';
import CalendarDialog from '../../../timeline/calendar/CalendarDialog';
import JourneyAboutDialog from '../../common/JourneyAboutDialog/JourneyAboutDialog';
import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { buildAboutUrl, buildUpdatesUrl } from '@/main/routing/urlBuilders';
import { useTranslation } from 'react-i18next';
import { useRouteResolver } from '@/main/routing/resolvers/RouteResolver';
import CommunityGuidelinesBlock from '../../../community/community/CommunityGuidelines/CommunityGuidelinesBlock';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

export interface SpaceDashboardPageProps {
  dialog?: 'about' | 'updates' | 'contributors' | 'calendar';
}

const SpaceDashboardPage: FC<SpaceDashboardPageProps> = ({ dialog }) => {
  const { t } = useTranslation();
  const currentPath = useResolvedPath('..');
  const { calendarEventNameId } = useParams();

  const [backToDashboard] = useBackToParentPage(`${currentPath.pathname}/dashboard`);

  const { spaceId, collaborationId, journeyPath } = useRouteResolver();

  return (
    <SpacePageLayout journeyPath={journeyPath} currentSection={EntityPageSection.Dashboard}>
      <SpaceDashboardContainer spaceId={spaceId}>
        {({ callouts, dashboardNavigation, ...entities }, state) => (
          <>
            <SpaceDashboardView
              spaceId={spaceId}
              collaborationId={collaborationId}
              vision={entities.space?.context?.vision}
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
              journeyTypeName="space"
              myMembershipStatus={entities.space?.community?.roleSet?.myMembershipStatus}
              shareUpdatesUrl={buildUpdatesUrl(entities.space?.profile.url ?? '')}
            />
            <CommunityUpdatesDialog
              open={dialog === 'updates'}
              onClose={backToDashboard}
              communityId={entities.space?.community?.id}
              shareUrl={buildUpdatesUrl(entities.space?.profile.url ?? '')}
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
                parentPath={entities.space?.profile.url ?? ''}
                calendarEventNameId={calendarEventNameId}
              />
            )}
            <JourneyAboutDialog
              open={dialog === 'about'}
              spaceLevel={SpaceLevel.Space}
              displayName={entities.space?.profile.displayName}
              tagline={entities.space?.profile.tagline}
              references={entities.references}
              sendMessageToCommunityLeads={entities.sendMessageToCommunityLeads}
              metrics={entities.space?.metrics}
              description={entities.space?.context?.vision}
              background={entities.space?.profile.description}
              who={entities.space?.context?.who}
              impact={entities.space?.context?.impact}
              guidelines={
                <CommunityGuidelinesBlock
                  communityId={entities.space?.community?.id}
                  journeyUrl={entities.space?.profile.url}
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
              shareUrl={buildAboutUrl(entities.space?.profile.url)}
            />
          </>
        )}
      </SpaceDashboardContainer>
    </SpacePageLayout>
  );
};

export default SpaceDashboardPage;
