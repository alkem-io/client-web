import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AssociatedOrganizationDetailsFragment,
  CalloutGroupName,
  CalloutsQueryVariables,
  CommunityMembershipStatus,
  DashboardLeadUserFragment,
  DashboardTopCalloutFragment,
  SpaceVisibility,
  SpaceWelcomeBlockContributorProfileFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import DashboardUpdatesSection from '../../../shared/components/DashboardSections/DashboardUpdatesSection';
import { ActivityLogResultType } from '../../../collaboration/activity/ActivityLog/ActivityComponent';
import PageContent from '../../../../core/ui/content/PageContent';
import { JourneyTypeName } from '../../JourneyTypeName';
import DashboardCalendarSection from '../../../shared/components/DashboardSections/DashboardCalendarSection';
import ApplicationButtonContainer from '../../../community/application/containers/ApplicationButtonContainer';
import ApplicationButton from '../../../community/application/applicationButton/ApplicationButton';
import { Theme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { InfoOutlined } from '@mui/icons-material';
import { DashboardNavigationItem } from '../SpaceDashboardNavigation/useSpaceDashboardNavigation';
import DashboardNavigation from '../SpaceDashboardNavigation/DashboardNavigation';
import useDirectMessageDialog from '../../../communication/messaging/DirectMessaging/useDirectMessageDialog';
import FullWidthButton from '../../../../core/ui/button/FullWidthButton';
import CalloutsGroupView from '../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';
import DashboardRecentContributionsBlock from '../../common/dashboardRecentContributionsBlock/DashboardRecentContributionsBlock';
import { OrderUpdate, TypedCallout } from '../../../collaboration/callout/useCallouts/useCallouts';
import JourneyDashboardWelcomeBlock from '../../common/journeyDashboardWelcomeBlock/JourneyDashboardWelcomeBlock';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { RECENT_ACTIVITIES_LIMIT_EXPANDED } from '../../common/journeyDashboard/constants';
import InfoColumn from '../../../../core/ui/content/InfoColumn';
import ContentColumn from '../../../../core/ui/content/ContentColumn';

interface SpaceWelcomeBlockContributor {
  profile: SpaceWelcomeBlockContributorProfileFragment;
}

interface SpaceDashboardViewProps {
  spaceId: string | undefined;
  displayName: string | undefined;
  spaceUrl: string | undefined;
  dashboardNavigation: DashboardNavigationItem[] | undefined;
  dashboardNavigationLoading: boolean;
  spaceVisibility?: SpaceVisibility;
  vision?: string;
  communityId?: string;
  organization?: unknown;
  leadOrganizations: (SpaceWelcomeBlockContributor & AssociatedOrganizationDetailsFragment)[] | undefined;
  leadUsers: (SpaceWelcomeBlockContributor & DashboardLeadUserFragment)[] | undefined;
  communityReadAccess: boolean;
  timelineReadAccess?: boolean;
  activities: ActivityLogResultType[] | undefined;
  fetchMoreActivities: (limit: number) => void;
  activityLoading: boolean;
  entityReadAccess: boolean;
  readUsersAccess: boolean;
  childEntitiesCount?: number;
  journeyTypeName: JourneyTypeName;
  recommendations?: ReactNode;
  topCallouts: DashboardTopCalloutFragment[] | undefined;
  loading: boolean;
  shareUpdatesUrl: string;
  myMembershipStatus: CommunityMembershipStatus | undefined;
  callouts: {
    groupedCallouts: Record<CalloutGroupName, TypedCallout[] | undefined>;
    canCreateCallout: boolean;
    canCreateCalloutFromTemplate: boolean;
    calloutNames: string[];
    loading: boolean;
    refetchCallouts: (variables?: Partial<CalloutsQueryVariables>) => void;
    refetchCallout: (calloutId: string) => void;
    onCalloutsSortOrderUpdate: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
  };
}

const SpaceDashboardView = ({
  spaceId,
  vision = '',
  displayName,
  dashboardNavigation,
  dashboardNavigationLoading,
  spaceVisibility,
  spaceUrl,
  communityId = '',
  communityReadAccess = false,
  timelineReadAccess = false,
  entityReadAccess,
  readUsersAccess,
  leadOrganizations,
  leadUsers,
  activities,
  fetchMoreActivities,
  activityLoading,
  journeyTypeName,
  callouts,
  topCallouts,
  shareUpdatesUrl,
  myMembershipStatus,
}: SpaceDashboardViewProps) => {
  const { t } = useTranslation();

  const hasExtendedApplicationButton = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  const translatedJourneyTypeName = t(`common.${journeyTypeName}` as const);

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  return (
    <>
      {directMessageDialog}
      <PageContent>
        <ApplicationButtonContainer>
          {({ applicationButtonProps }, { loading }) => {
            if (loading || applicationButtonProps.isMember) {
              return null;
            }

            return (
              <InfoColumn>
                <ApplicationButton
                  {...applicationButtonProps}
                  loading={loading}
                  component={FullWidthButton}
                  extended={hasExtendedApplicationButton}
                  journeyTypeName="space"
                />
              </InfoColumn>
            );
          }}
        </ApplicationButtonContainer>
        <InfoColumn>
          <JourneyDashboardWelcomeBlock
            vision={vision}
            leadUsers={leadUsers}
            onContactLeadUser={receiver => sendMessage('user', receiver)}
            leadOrganizations={leadOrganizations}
            onContactLeadOrganization={receiver => sendMessage('organization', receiver)}
            journeyTypeName="space"
            member={myMembershipStatus === CommunityMembershipStatus.Member}
          />
          <FullWidthButton
            startIcon={<InfoOutlined />}
            component={RouterLink}
            to={EntityPageSection.About}
            variant="contained"
          >
            {t('common.aboutThis', { entity: translatedJourneyTypeName })}
          </FullWidthButton>
          <DashboardNavigation
            spaceUrl={spaceUrl}
            spaceVisibility={spaceVisibility}
            displayName={displayName}
            dashboardNavigation={dashboardNavigation}
            loading={dashboardNavigationLoading}
          />
          {timelineReadAccess && <DashboardCalendarSection journeyId={spaceId} journeyTypeName={journeyTypeName} />}
          {communityReadAccess && <DashboardUpdatesSection communityId={communityId} shareUrl={shareUpdatesUrl} />}
          <CalloutsGroupView
            callouts={callouts.groupedCallouts[CalloutGroupName.Home_1]}
            canCreateCallout={callouts.canCreateCallout}
            canCreateCalloutFromTemplate={callouts.canCreateCalloutFromTemplate}
            loading={callouts.loading}
            journeyTypeName={journeyTypeName}
            calloutNames={callouts.calloutNames}
            onSortOrderUpdate={callouts.onCalloutsSortOrderUpdate}
            onCalloutUpdate={callouts.refetchCallout}
            groupName={CalloutGroupName.Home_1}
          />
        </InfoColumn>

        <ContentColumn>
          <DashboardRecentContributionsBlock
            halfWidth={(callouts.groupedCallouts[CalloutGroupName.Home_2]?.length ?? 0) > 0}
            readUsersAccess={readUsersAccess}
            entityReadAccess={entityReadAccess}
            activitiesLoading={activityLoading}
            topCallouts={topCallouts}
            activities={activities}
            journeyTypeName={journeyTypeName}
            onActivitiesDialogOpen={() => fetchMoreActivities(RECENT_ACTIVITIES_LIMIT_EXPANDED)}
          />
          <CalloutsGroupView
            callouts={callouts.groupedCallouts[CalloutGroupName.Home_2]}
            canCreateCallout={callouts.canCreateCallout}
            canCreateCalloutFromTemplate={callouts.canCreateCalloutFromTemplate}
            loading={callouts.loading}
            journeyTypeName={journeyTypeName}
            calloutNames={callouts.calloutNames}
            onSortOrderUpdate={callouts.onCalloutsSortOrderUpdate}
            onCalloutUpdate={callouts.refetchCallout}
            groupName={CalloutGroupName.Home_2}
            blockProps={(callout, index) => {
              if (index === 0) {
                return {
                  halfWidth: true,
                };
              }
            }}
          />
        </ContentColumn>
      </PageContent>
    </>
  );
};

export default SpaceDashboardView;
